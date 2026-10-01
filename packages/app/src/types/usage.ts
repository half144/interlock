import type { AgentKind } from "./agent";

type UsageTone = "default" | "ok" | "warning" | "danger";

export interface UsageWindow {
  id: string;
  label: string;
  usedPct: number | null;
  remainingPct: number | null;
  /** Epoch milliseconds. */
  resetsAt: number | null;
  tone: UsageTone;
}

export interface UsageBalance {
  id: string;
  label: string;
  remaining: number | null;
  unit: "usd" | "credits" | "requests" | "tokens";
}

export interface ProviderUsage {
  kind: AgentKind;
  label: string;
  status: "available" | "unavailable" | "error";
  plan: string | null;
  windows: UsageWindow[];
  balances: UsageBalance[];
  error: string | null;
}
