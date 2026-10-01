import { describe, expect, it } from "vitest";
import { canPlanFirst, featuresFor, modeFor } from "./modes";

describe("modeFor", () => {
  it("starts Claude in plan mode when asked, otherwise by autonomy", () => {
    expect(modeFor("claude", "plan", "auto")).toBe("plan");
    expect(modeFor("claude", "auto", "auto")).toBe("auto");
    expect(modeFor("claude", "auto", "full-auto")).toBe("bypassPermissions");
  });

  it("maps Codex autonomy and keeps it when planning", () => {
    expect(modeFor("codex", "plan", "auto")).toBe("auto");
    expect(modeFor("codex", "auto", "full-auto")).toBe("full-access");
  });

  it("turns on Codex's plan collaboration mode for a plan-first task only", () => {
    expect(featuresFor("codex", "plan")).toEqual({ plan_mode: true });
    expect(featuresFor("codex", "auto")).toBeNull();
    expect(featuresFor("claude", "plan")).toBeNull();
  });

  it("offers plan first for Claude and Codex but not the mock provider", () => {
    expect([canPlanFirst("claude"), canPlanFirst("codex"), canPlanFirst("mock")]).toEqual([
      true,
      true,
      false,
    ]);
  });

  it("leaves the mock provider on its default", () => {
    expect(modeFor("mock", "auto", "auto")).toBeNull();
  });
});
