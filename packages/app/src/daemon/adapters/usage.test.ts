import { describe, expect, it } from "vitest";
import { toProviderUsage, type ProviderUsagePayload } from "./usage";

const codex: ProviderUsagePayload = {
  providerId: "codex",
  displayName: "Codex",
  status: "available",
  planLabel: "plus",
  windows: [
    {
      id: "session",
      label: "Session",
      usedPct: 9,
      remainingPct: 91,
      resetsAt: "2026-10-01T16:40:42.000Z",
      tone: "ok",
    },
    { id: "weekly", label: "Weekly" },
  ],
  balances: [{ id: "credits", label: "Credits", remaining: 12.5, unit: "usd" }],
};

describe("toProviderUsage", () => {
  it("converts windows and times", () => {
    const usage = toProviderUsage(codex);
    expect(usage).toMatchObject({ kind: "codex", plan: "plus", error: null });
    expect(usage?.windows[0]).toEqual({
      id: "session",
      label: "Session",
      usedPct: 9,
      remainingPct: 91,
      resetsAt: Date.parse("2026-10-01T16:40:42.000Z"),
      tone: "ok",
    });
    expect(usage?.windows[1]).toMatchObject({ usedPct: null, resetsAt: null, tone: "default" });
  });

  it("keeps balances", () => {
    expect(toProviderUsage(codex)?.balances).toEqual([
      { id: "credits", label: "Credits", remaining: 12.5, unit: "usd" },
    ]);
  });

  it("ignores other providers", () => {
    expect(toProviderUsage({ ...codex, providerId: "gemini" })).toBeNull();
  });
});
