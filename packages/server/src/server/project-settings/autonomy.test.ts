import { describe, expect, it } from "vitest";
import { resolveAutonomyModeId } from "./autonomy.js";

describe("resolveAutonomyModeId", () => {
  it.each([
    ["claude", "auto", "auto"],
    ["claude", "full-auto", "bypassPermissions"],
    ["codex", "auto", "auto"],
    ["codex", "full-auto", "full-access"],
  ] as const)("maps %s %s to %s", (provider, autonomy, expected) => {
    expect(resolveAutonomyModeId(provider, autonomy, undefined)).toBe(expected);
  });

  it("keeps plan mode when the task asks to plan first", () => {
    expect(resolveAutonomyModeId("claude", "full-auto", "plan")).toBe("plan");
  });

  it("leaves providers without an autonomy mapping alone", () => {
    expect(resolveAutonomyModeId("mock", "full-auto", "default")).toBe("default");
    expect(resolveAutonomyModeId("mock", "auto", undefined)).toBeUndefined();
  });
});
