import { describe, expect, it } from "vitest";
import type { ProviderUsage, UsageWindow } from "@/types";
import { balanceText, providerView, resetsIn, splitLead } from "./usage";

const window = (id: string, remainingPct: number | null): UsageWindow => ({
  id,
  label: id,
  usedPct: null,
  remainingPct,
  resetsAt: null,
  tone: "ok",
});

const usage = (patch: Partial<ProviderUsage>): ProviderUsage => ({
  kind: "claude",
  label: "Claude",
  status: "available",
  plan: null,
  windows: [window("five_hour", 64)],
  balances: [],
  error: null,
  ...patch,
});

const now = Date.parse("2026-10-01T10:00:00Z");

describe("resetsIn", () => {
  it("formats the time left", () => {
    expect(resetsIn(now + (2 * 60 + 14) * 60_000, now)).toBe("2h 14m");
    expect(resetsIn(now + 14 * 60_000, now)).toBe("14m");
    expect(resetsIn(now + 20_000, now)).toBe("now");
    expect(resetsIn(now + 50 * 3_600_000, now)).toBe("2d 2h");
    expect(resetsIn(null, now)).toBeNull();
  });
});

describe("balanceText", () => {
  it("formats by unit", () => {
    expect(balanceText(12.5, "usd")).toBe("$12.50");
    expect(balanceText(1200, "credits")).toBe("1,200 credits");
  });
});

describe("splitLead", () => {
  const view = (id: string, remainingPct: number | null) => ({
    id,
    label: id,
    remainingPct,
    resets: null,
    tone: "ok" as const,
  });

  it("leads with the window that has the least left", () => {
    const { lead, rest } = splitLead([view("session", 76), view("weekly", 24), view("opus", 60)]);
    expect(lead?.id).toBe("weekly");
    expect(rest.map((w) => w.id)).toEqual(["session", "opus"]);
  });

  it("keeps the provider's order on a tie and skips windows without a reading", () => {
    const { lead, rest } = splitLead([
      view("unknown", null),
      view("session", 40),
      view("weekly", 40),
    ]);
    expect(lead?.id).toBe("session");
    expect(rest.map((w) => w.id)).toEqual(["unknown", "weekly"]);
  });

  it("has no lead when nothing was measured", () => {
    expect(splitLead([view("session", null)])).toEqual({
      lead: null,
      rest: [view("session", null)],
    });
    expect(splitLead([])).toEqual({ lead: null, rest: [] });
  });
});

describe("providerView", () => {
  it("leads with the tightest window, carrying the server's tone and reset", () => {
    const view = providerView(
      "codex",
      usage({
        kind: "codex",
        label: "Codex",
        plan: "plus",
        windows: [
          { ...window("session", 9.6), resetsAt: now + 90 * 60_000, tone: "danger" },
          { ...window("weekly", 70), resetsAt: now + 20_000 },
        ],
        balances: [{ id: "credits", label: "Credits", remaining: 3, unit: "usd" }],
      }),
      now,
    );
    expect(view.lead).toEqual({
      id: "session",
      label: "session",
      remainingPct: 10,
      resets: "resets in 1h 30m",
      tone: "danger",
    });
    expect(view.rest.map((w) => [w.id, w.resets])).toEqual([["weekly", "resets now"]]);
    expect(view.balances).toEqual([{ id: "credits", label: "Credits", text: "$3.00" }]);
    expect(view.plan).toBe("Plus");
    expect(view.reason).toBeNull();
  });

  it("clamps readings to 0–100", () => {
    const view = providerView("claude", usage({ windows: [window("five_hour", -4)] }), now);
    expect(view.lead?.remainingPct).toBe(0);
    expect(
      providerView("claude", usage({ windows: [window("w", 130)] }), now).lead?.remainingPct,
    ).toBe(100);
  });

  it("hides balances with nothing left to spend", () => {
    const view = providerView(
      "codex",
      usage({
        balances: [
          { id: "spent", label: "Credits", remaining: 0, unit: "usd" },
          { id: "unknown", label: "Credits", remaining: null, unit: "usd" },
        ],
      }),
      now,
    );
    expect(view.balances).toEqual([]);
  });

  it("says why when there is nothing to show", () => {
    expect(providerView("claude", undefined, now)).toMatchObject({
      label: "Claude Code",
      reason: "Usage not loaded yet",
      lead: null,
      rest: [],
    });
    expect(
      providerView("claude", usage({ status: "error", error: "Token expired" }), now).reason,
    ).toBe("Token expired");
    expect(providerView("claude", usage({ status: "unavailable" }), now).reason).toBe(
      "Usage is not available",
    );
    expect(providerView("claude", usage({ windows: [] }), now).reason).toBe("No usage reported");
  });
});
