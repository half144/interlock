import { parseDiff } from "@/lib/parseDiff";
import type { FileDiff } from "@/types";

const refresh = parseDiff(
  "src/lib/session/refresh.ts",
  `
@@ -1,9 +1,12 @@
 import { tokenStore } from './tokenStore'
 import { api } from '../api'
+
+let inFlight: Promise<Session> | null = null

 export interface Session {
   accessToken: string
   refreshToken: string
   expiresAt: number
 }
@@ -22,18 +25,37 @@ export async function refreshSession(): Promise<Session> {
-export async function refreshSession(): Promise<Session> {
-  const current = tokenStore.get()
-  const res = await api.post('/auth/refresh', { token: current.refreshToken })
-  const next = res.data as Session
-  tokenStore.set(next)
-  return next
-}
+// Focus and 401 handlers can both trigger a refresh. Rotating the token twice
+// revokes the one the first request is still using, so collapse them.
+export function refreshSession(): Promise<Session> {
+  if (inFlight) return inFlight
+
+  inFlight = (async () => {
+    const current = tokenStore.get()
+    const res = await api.post('/auth/refresh', { token: current.refreshToken })
+    const next = res.data as Session
+    tokenStore.set(next)
+    return next
+  })()
+
+  return inFlight.finally(() => {
+    inFlight = null
+  })
+}
+
+export async function withFreshSession<T>(run: () => Promise<T>): Promise<T> {
+  try {
+    return await run()
+  } catch (error) {
+    if (!isUnauthorized(error)) throw error
+    await refreshSession()
+    return run()
+  }
+}
`,
);

const useCart = parseDiff(
  "src/app/checkout/useCart.ts",
  `
@@ -3,7 +3,7 @@
 import { useMutation, useQueryClient } from '@tanstack/react-query'
-import { api } from '@/lib/api'
+import { api, withFreshSession } from '@/lib/api'
 import type { Cart, CartLine } from './types'

 export function useCart(cartId: string) {
@@ -31,12 +31,15 @@ export function useCart(cartId: string) {
   const addLine = useMutation({
-    mutationFn: (line: CartLine) => api.post(\`/carts/\${cartId}/lines\`, line),
+    mutationFn: (line: CartLine) =>
+      withFreshSession(() => api.post(\`/carts/\${cartId}/lines\`, line)),
     onSuccess: (res) => {
       queryClient.setQueryData(['cart', cartId], res.data as Cart)
     },
   })
`,
);

const refreshTest = parseDiff(
  "src/lib/session/refresh.test.ts",
  `
@@ -0,0 +1,14 @@
+import { describe, expect, it, vi } from 'vitest'
+import { refreshSession } from './refresh'
+import { api } from '../api'
+
+describe('refreshSession', () => {
+  it('collapses overlapping refreshes into one request', async () => {
+    const post = vi.spyOn(api, 'post').mockResolvedValue({ data: fakeSession() })
+
+    await Promise.all([refreshSession(), refreshSession(), refreshSession()])
+
+    expect(post).toHaveBeenCalledTimes(1)
+  })
+})
`,
  "added",
);

const addressField = parseDiff(
  "src/components/address/AddressField.tsx",
  `
@@ -1,14 +1,19 @@
-import { useState } from 'react'
+import { useId, useRef, useState } from 'react'
 import { Input } from '@lumen/ui-kit'
-import { searchAddresses } from '@/lib/places'
+import { useAddressSearch } from './useAddressSearch'
+import { SuggestionList } from './SuggestionList'

 export function AddressField({ value, onChange }: AddressFieldProps) {
-  const [results, setResults] = useState<Place[]>([])
-
-  async function handleInput(query: string) {
-    setResults(await searchAddresses(query))
-  }
+  const listId = useId()
+  const inputRef = useRef<HTMLInputElement>(null)
+  const [query, setQuery] = useState(value?.line1 ?? '')
+  const [active, setActive] = useState(-1)
+  const { results, status } = useAddressSearch(query, { debounceMs: 180 })
+  const open = status !== 'idle' && query.length > 2

   return (
-    <div className="relative">
-      <Input onChange={(e) => handleInput(e.target.value)} />
+    <div className="address-field" data-open={open}>
+      <Input
+        ref={inputRef}
+        role="combobox"
+        aria-expanded={open}
+        aria-controls={listId}
+        aria-activedescendant={active >= 0 ? \`\${listId}-\${active}\` : undefined}
+        value={query}
+        onChange={(e) => setQuery(e.target.value)}
+        onKeyDown={(e) => setActive(nextIndex(e.key, active, results.length + 1))}
+      />
@@ -22,9 +27,14 @@ export function AddressField({ value, onChange }: AddressFieldProps) {
-      {results.length > 0 && (
-        <ul className="absolute top-full w-full">
-          {results.map((r) => <li key={r.id}>{r.label}</li>)}
-        </ul>
-      )}
+      {/* The slot keeps its height while closed so opening never shifts the form. */}
+      <SuggestionList
+        id={listId}
+        open={open}
+        results={results}
+        active={active}
+        loading={status === 'loading'}
+        onPick={(place) => onChange(toAddress(place))}
+        onManual={() => onChange(emptyAddress(query))}
+      />
     </div>
   )
 }
`,
);

const addressSearch = parseDiff(
  "src/components/address/useAddressSearch.ts",
  `
@@ -0,0 +1,24 @@
+import { useEffect, useState } from 'react'
+import { searchAddresses, type Place } from '@/lib/places'
+
+type Status = 'idle' | 'loading' | 'ready' | 'empty' | 'error'
+
+export function useAddressSearch(query: string, { debounceMs = 180 } = {}) {
+  const [results, setResults] = useState<Place[]>([])
+  const [status, setStatus] = useState<Status>('idle')
+
+  useEffect(() => {
+    if (query.length < 3) return setStatus('idle')
+    const controller = new AbortController()
+    const timer = setTimeout(async () => {
+      setStatus('loading')
+      const next = await searchAddresses(query, { signal: controller.signal })
+      setResults(next)
+      setStatus(next.length ? 'ready' : 'empty')
+    }, debounceMs)
+    return () => {
+      clearTimeout(timer)
+      controller.abort()
+    }
+  }, [query, debounceMs])
+
+  return { results, status }
+}
`,
  "added",
);

const refundService = parseDiff(
  "src/refunds/service.ts",
  `
@@ -84,14 +84,31 @@ export class RefundService {
   async create(input: CreateRefund, ctx: RequestContext) {
+    const key = ctx.headers['idempotency-key']
+    if (key) {
+      const existing = await this.db.refundKeys.find(key, input.chargeId)
+      if (existing) return existing.refund
+    }
+
     const charge = await this.charges.get(input.chargeId)
     if (charge.refundable < input.amount) {
       throw new RefundError('AMOUNT_EXCEEDS_REFUNDABLE')
     }
-    const refund = await this.db.refunds.insert({ ...input, status: 'pending' })
-    await this.gateway.refund(charge, input.amount)
-    return refund
+
+    return this.db.transaction(async (tx) => {
+      const refund = await tx.refunds.insert({ ...input, status: 'pending' })
+      if (key) await tx.refundKeys.insert({ key, chargeId: input.chargeId, refundId: refund.id })
+      await this.gateway.refund(charge, input.amount, { idempotencyKey: key ?? refund.id })
+      return refund
+    })
   }
`,
);

const migration = parseDiff(
  "migrations/0142_refund_keys.sql",
  `
@@ -0,0 +1,9 @@
+create table refund_keys (
+  key         text        not null,
+  charge_id   uuid        not null references charges(id),
+  refund_id   uuid        not null references refunds(id),
+  created_at  timestamptz not null default now(),
+  primary key (key, charge_id)
+);
+
+create index refund_keys_created_at on refund_keys (created_at);
`,
  "added",
);

const webhookRetry = parseDiff(
  "src/webhooks/retry.ts",
  `
@@ -1,6 +1,18 @@
-export async function deliver(hook: Webhook, payload: unknown) {
-  return fetch(hook.url, { method: 'POST', body: JSON.stringify(payload) })
+const MAX_ATTEMPTS = 6
+
+export async function deliver(hook: Webhook, payload: unknown, attempt = 1): Promise<void> {
+  const res = await fetch(hook.url, { method: 'POST', body: JSON.stringify(payload) })
+  if (res.ok || attempt >= MAX_ATTEMPTS) return
+
+  // 2s, 4s, 8s … capped at 5 minutes, with full jitter.
+  const ceiling = Math.min(300_000, 2_000 * 2 ** (attempt - 1))
+  await sleep(Math.random() * ceiling)
+  return deliver(hook, payload, attempt + 1)
 }
`,
);

const focusTokens = parseDiff(
  "src/tokens/focus.css",
  `
@@ -0,0 +1,10 @@
+:root {
+  --focus-ring-width: 2px;
+  --focus-ring-offset: 2px;
+  --focus-ring-color: var(--color-ink-strong);
+}
+
+:where(button, a, input, [tabindex]):focus-visible {
+  outline: var(--focus-ring-width) solid var(--focus-ring-color);
+  outline-offset: var(--focus-ring-offset);
+}
`,
  "added",
);

const payoutFormat = parseDiff(
  "src/payouts/format.ts",
  `
@@ -12,9 +12,17 @@ export function formatPayout(amount: number, currency: string) {
-  return (amount / 100).toFixed(2)
+  const digits = minorUnits(currency)
+  return (amount / 10 ** digits).toFixed(digits)
+}
+
+// ISO 4217 currencies with three minor units (BHD, KWD, OMR …).
+const THREE_DECIMALS = new Set(['BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND'])
+
+function minorUnits(currency: string) {
+  return THREE_DECIMALS.has(currency) ? 3 : 2
 }
`,
);

export const diffs: Record<string, FileDiff[]> = {
  "CHK-41": [refresh, useCart, refreshTest],
  "CHK-38": [addressField, addressSearch],
  "LED-112": [refundService, migration],
  "LED-113": [webhookRetry],
  "KIT-27": [focusTokens],
  "LED-109": [payoutFormat],
};
