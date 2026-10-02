import type { AgentKind, ProviderUsage, UsageBalance, UsageWindow } from "@/types";
import { kindLabel } from "./agentKinds";

export type UsageTone = UsageWindow["tone"];

interface WindowView {
  id: string;
  label: string;
  /** Whole percent, 0–100. */
  remainingPct: number | null;
  resets: string | null;
  tone: UsageTone;
}

export type MeasuredWindow = WindowView & { remainingPct: number };

export interface ProviderView {
  kind: AgentKind;
  label: string;
  plan: string | null;
  /** Why there is nothing to show; null when the provider reported usage. */
  reason: string | null;
  /** The window with the least left: what the pill reads and the popover leads with. */
  lead: MeasuredWindow | null;
  rest: WindowView[];
  balances: { id: string; label: string; text: string }[];
}

export const USAGE_KINDS: AgentKind[] = ["claude", "codex"];

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

function resetPhrase(resetsAt: number | null, now: number): string | null {
  const left = resetsIn(resetsAt, now);
  if (left === null) return null;
  return left === "now" ? "resets now" : `resets in ${left}`;
}

export function balanceText(remaining: number, unit: UsageBalance["unit"]): string {
  if (unit === "usd") return `$${remaining.toFixed(2)}`;
  return `${Math.round(remaining).toLocaleString("en-US")} ${unit}`;
}

const isMeasured = (w: WindowView): w is MeasuredWindow => w.remainingPct !== null;

/** Ties keep the provider's order, so the session window wins over a weekly one at the same level. */
export function splitLead(windows: WindowView[]): {
  lead: MeasuredWindow | null;
  rest: WindowView[];
} {
  const lead = windows
    .filter(isMeasured)
    .reduce<MeasuredWindow | null>(
      (least, w) => (least === null || w.remainingPct < least.remainingPct ? w : least),
      null,
    );
  return { lead, rest: windows.filter((w) => w !== lead) };
}

const sentenceCase = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

const windowView = (w: UsageWindow, now: number): WindowView => ({
  id: w.id,
  label: w.label,
  remainingPct:
    w.remainingPct === null ? null : Math.round(Math.min(100, Math.max(0, w.remainingPct))),
  resets: resetPhrase(w.resetsAt, now),
  tone: w.tone,
});

// An empty balance is noise next to the windows; it only matters once there is something to spend.
const balanceViews = (balances: UsageBalance[]) =>
  balances.flatMap((b) =>
    b.remaining !== null && b.remaining > 0
      ? [{ id: b.id, label: b.label, text: balanceText(b.remaining, b.unit) }]
      : [],
  );

const RATE_LIMITED = /\b429\b/;

const unavailable = (reason: string) => ({ reason, lead: null, rest: [], balances: [] });

function readings(usage: ProviderUsage | undefined, now: number) {
  if (!usage) return unavailable("Usage not loaded yet");
  if (usage.status !== "available") {
    const error = usage.error ?? "Usage is not available";
    return unavailable(
      RATE_LIMITED.test(error)
        ? "Usage checks are rate limited right now. Try again in a minute."
        : error,
    );
  }
  const windows = usage.windows.map((w) => windowView(w, now));
  const balances = balanceViews(usage.balances);
  if (windows.length === 0 && balances.length === 0) return unavailable("No usage reported");
  return { reason: null, ...splitLead(windows), balances };
}

export function providerView(
  kind: AgentKind,
  usage: ProviderUsage | undefined,
  now: number,
): ProviderView {
  return {
    kind,
    label: kindLabel(kind),
    plan: usage?.plan ? sentenceCase(usage.plan) : null,
    ...readings(usage, now),
  };
}
