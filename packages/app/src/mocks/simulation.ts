import type { LogLine, Subagent, SubagentEvent } from "@/types";

// Scripted content the store's simulation draws from while no real agent is connected.

/** What each live subagent hands back when the simulation finishes it. */
export const completions: Record<string, Pick<Subagent, "result" | "findings" | "usedIn">> = {
  "LED-112.2": {
    result:
      "Migration 0142 is safe: it only creates a new table and index, so nothing existing is locked. The rollback is written and passed a dry run.",
    findings: [
      "No locks on existing tables",
      "Rollback drops the index and table in one transaction",
    ],
    usedIn: "Add the refund_keys table",
  },
  "LED-112.3": {
    result:
      "Added 4 tests. A replay with the same key returns the original refund, and two concurrent requests create exactly one refund.",
    findings: [
      "Replay returns the original refund (200, same id)",
      "Concurrent requests: 1 refund, 1 gateway call",
      "Different keys on the same charge still respect the refundable amount",
    ],
    usedIn: "Test replays and concurrent requests",
  },
};

/** What a running subagent might do next, drawn at random by the simulation. */
export const subagentStream: Omit<SubagentEvent, "sec">[] = [
  {
    kind: "read",
    text: "migrations/0141_payout_index.sql",
    meta: "whole file",
    from: 1,
    body: [
      "CREATE INDEX CONCURRENTLY payouts_status_idx",
      "  ON payouts (status)",
      "  WHERE status = 'pending';",
    ],
  },
  {
    kind: "bash",
    text: "pnpm migrate:dry-run 0142",
    meta: "exit 0",
    body: [
      "BEGIN",
      "  apply 0142_refund_keys … ok",
      "  rollback 0142_refund_keys … ok",
      "ROLLBACK (dry run)",
    ],
  },
  {
    kind: "search",
    text: "refund_keys",
    meta: "4 results",
    body: [
      "migrations/0142_refund_keys.sql:1  CREATE TABLE refund_keys (",
      "src/refunds/service.ts:61  await db.refundKeys.insert({ key, refundId })",
      'src/refunds/routes.ts:22  const key = req.header("Idempotency-Key")',
    ],
  },
  {
    kind: "edit",
    text: "migrations/0142_refund_keys.down.sql",
    meta: "+4",
    body: [
      "+BEGIN;",
      "+DROP INDEX IF EXISTS refund_keys_created_at;",
      "+DROP TABLE IF EXISTS refund_keys;",
      "+COMMIT;",
    ],
  },
  { kind: "note", text: "The rollback drops the table and index in one transaction." },
];

/** Lines the simulation streams into running agents' terminals. */
export const streamPool: LogLine[] = [
  { kind: "out", text: "tsc --noEmit -p tsconfig.json" },
  { kind: "ok", text: " ✓ typecheck clean" },
  { kind: "out", text: "eslint src --max-warnings 0" },
  { kind: "ok", text: " ✓ 0 problems" },
  { kind: "cmd", text: "pnpm vitest run --changed" },
  { kind: "ok", text: " ✓ 3 test files passed" },
  { kind: "out", text: "reading src/lib/api/client.ts" },
  { kind: "out", text: "applying edit to 2 hunks" },
  { kind: "dim", text: "checkpoint saved" },
];
