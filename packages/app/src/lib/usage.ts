import type { AgentKind, ProviderUsage, UsageBalance, UsageWindow } from "@/types";
import { kindLabel } from "./agentKinds";

/** Below this much left in the 5h window the ring turns amber. */
const LOW_REMAINING_PCT = 20;

const SESSION_IDS = new Set(["five_hour", "session"]);

const sessionWindow = (usage: ProviderUsage | undefined): UsageWindow | undefined =>
  usage?.windows.find((w) => SESSION_IDS.has(w.id));

export type RingState =
  | { kind: "ok" | "low"; remainingPct: number }
  | { kind: "unavailable"; reason: string };

export function ringState(usage: ProviderUsage | undefined): RingState {
  if (!usage) return { kind: "unavailable", reason: "Usage not loaded yet" };
  if (usage.status !== "available") {
    return { kind: "unavailable", reason: usage.error ?? "Usage is not available" };
  }
  const remaining = sessionWindow(usage)?.remainingPct;
  if (remaining == null) return { kind: "unavailable", reason: "No 5h window reported" };
  const remainingPct = Math.min(100, Math.max(0, remaining));
  return { kind: remainingPct < LOW_REMAINING_PCT ? "low" : "ok", remainingPct };
}

/** "2h 14m", "14m", "now". */
export function resetsIn(resetsAt: number | null, now: number): string | null {
  if (resetsAt === null) return null;
  const minutes = Math.max(0, Math.round((resetsAt - now) / 60_000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

export function balanceText({ remaining, unit }: UsageBalance): string | null {
  if (remaining === null) return null;
  if (unit === "usd") return `$${remaining.toFixed(2)}`;
  return `${Math.round(remaining).toLocaleString("en-US")} ${unit}`;
}

interface WindowView {
  id: string;
  label: string;
  remainingPct: number | null;
  resets: string | null;
  low: boolean;
}

export interface ProviderView {
  kind: AgentKind;
  label: string;
  plan: string | null;
  ring: RingState;
  windows: WindowView[];
  balances: { id: string; label: string; text: string }[];
}

export const USAGE_KINDS: AgentKind[] = ["claude", "codex"];

export function providerView(
  kind: AgentKind,
  usage: ProviderUsage | undefined,
  now: number,
): ProviderView {
  const windows = usage?.status === "available" ? usage.windows : [];
  return {
    kind,
    label: usage?.label ?? kindLabel(kind),
    plan: usage?.plan ?? null,
    ring: ringState(usage),
    windows: windows.map((w) => ({
      id: w.id,
      label: w.label,
      remainingPct: w.remainingPct,
      resets: resetsIn(w.resetsAt, now),
      low: w.remainingPct !== null && w.remainingPct < LOW_REMAINING_PCT,
    })),
    balances: (usage?.status === "available" ? usage.balances : []).flatMap((b) => {
      const text = balanceText(b);
      return text ? [{ id: b.id, label: b.label, text }] : [];
    }),
  };
}
