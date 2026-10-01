import type { LogLine } from "@/types";

const setup = (branch: string): LogLine[] => [
  { kind: "dim", text: `interlock · worktree ~/.interlock/worktrees/${branch}` },
  { kind: "cmd", text: "pnpm install --frozen-lockfile" },
  { kind: "out", text: "Lockfile is up to date, resolution step is skipped" },
  { kind: "out", text: "Packages: +1284" },
  { kind: "ok", text: "Done in 6.2s using pnpm v10.14.0" },
];

export const logs: Record<string, LogLine[]> = {
  "CHK-41": [
    ...setup("agent/chk-41-session-refresh-race"),
    { kind: "cmd", text: "pnpm vitest run session" },
    { kind: "out", text: " RUN  v3.2.4 /checkout-web" },
    { kind: "ok", text: " ✓ src/lib/session/refresh.test.ts (6 tests) 412ms" },
    { kind: "ok", text: " ✓ src/app/checkout/useCart.test.ts (5 tests) 288ms" },
    { kind: "out", text: "" },
    { kind: "ok", text: " Test Files  2 passed (2)" },
    { kind: "ok", text: "      Tests  11 passed (11)" },
    { kind: "dim", text: "⏸ held: waiting for a decision on expired carts" },
  ],
  "LED-112": [
    ...setup("agent/led-112-refund-idempotency"),
    { kind: "cmd", text: "docker compose up -d postgres" },
    { kind: "ok", text: " ✔ Container ledger-postgres  Started" },
    { kind: "cmd", text: "pnpm migrate:make refund_keys" },
    { kind: "out", text: "Created migrations/0142_refund_keys.sql" },
  ],
};
