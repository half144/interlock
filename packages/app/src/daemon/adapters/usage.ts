import type { ProviderUsage as ProviderUsagePayload } from "@interlock/protocol/messages";
import type { ProviderUsage, UsageBalance, UsageWindow } from "@/types";
import { kindOf } from "./providers";

export type { ProviderUsagePayload };

type WindowPayload = ProviderUsagePayload["windows"][number];

const toWindow = (w: WindowPayload): UsageWindow => ({
  id: w.id,
  label: w.label,
  usedPct: w.usedPct ?? null,
  remainingPct: w.remainingPct ?? null,
  resetsAt: w.resetsAt ? Date.parse(w.resetsAt) : null,
  tone: w.tone ?? "default",
});

const toBalance = (b: NonNullable<ProviderUsagePayload["balances"]>[number]): UsageBalance => ({
  id: b.id,
  label: b.label,
  remaining: b.remaining ?? null,
  unit: b.unit,
});

export function toProviderUsage(payload: ProviderUsagePayload): ProviderUsage | null {
  const kind = kindOf(payload.providerId);
  if (!kind) return null;
  return {
    kind,
    label: payload.displayName,
    status: payload.status,
    plan: payload.planLabel,
    windows: payload.windows.map(toWindow),
    balances: (payload.balances ?? []).map(toBalance),
    error: payload.error ?? null,
  };
}
