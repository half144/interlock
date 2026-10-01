import { describe, expect, it } from "vitest";
import type { ProviderUsage, UsageWindow } from "@/types";
import { balanceText, providerView, resetsIn, ringState } from "./usage";

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

describe("ringState", () => {
  it("shows what is left of the 5h window", () => {
    expect(ringState(usage({}))).toEqual({ kind: "ok", remainingPct: 64 });
    expect(ringState(usage({ kind: "codex", windows: [window("session", 91)] }))).toEqual({
      kind: "ok",
      remainingPct: 91,
    });
  });

  it("turns low under 20%", () => {
    expect(ringState(usage({ windows: [window("five_hour", 19)] }))).toEqual({
      kind: "low",
      remainingPct: 19,
    });
    expect(ringState(usage({ windows: [window("five_hour", 20)] })).kind).toBe("ok");
  });

  it("is unavailable with a reason, never throwing", () => {
    expect(ringState(undefined).kind).toBe("unavailable");
    expect(ringState(usage({ status: "error", error: "Token expired" }))).toEqual({
      kind: "unavailable",
      reason: "Token expired",
    });
    expect(ringState(usage({ status: "unavailable" }))).toMatchObject({
      reason: "Usage is not available",
    });
    expect(ringState(usage({ windows: [] })).kind).toBe("unavailable");
  });
});

describe("resetsIn", () => {
  const now = Date.parse("2026-10-01T10:00:00Z");
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
    expect(balanceText({ id: "c", label: "Credits", remaining: 12.5, unit: "usd" })).toBe("$12.50");
    expect(balanceText({ id: "c", label: "x", remaining: 1200, unit: "credits" })).toBe(
      "1,200 credits",
    );
    expect(balanceText({ id: "c", label: "x", remaining: null, unit: "usd" })).toBeNull();
  });
});

describe("providerView", () => {
  const now = Date.parse("2026-10-01T10:00:00Z");

  it("lists windows with their reset and balances", () => {
    const view = providerView(
      "codex",
      usage({
        kind: "codex",
        label: "Codex",
        plan: "plus",
        windows: [{ ...window("session", 10), resetsAt: now + 90 * 60_000 }, window("weekly", 70)],
        balances: [{ id: "credits", label: "Credits", remaining: 3, unit: "usd" }],
      }),
      now,
    );
    expect(view.windows.map((w) => [w.label, w.resets, w.low])).toEqual([
      ["session", "1h 30m", true],
      ["weekly", null, false],
    ]);
    expect(view.balances).toEqual([{ id: "credits", label: "Credits", text: "$3.00" }]);
    expect(view.plan).toBe("plus");
  });

  it("is empty and dimmed when the provider reported nothing", () => {
    const view = providerView("claude", undefined, now);
    expect(view.windows).toEqual([]);
    expect(view.ring.kind).toBe("unavailable");
    expect(view.label).toBe("Claude Code");
  });
});
