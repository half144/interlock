import { describe, expect, it } from "vitest";
import { accessOf, accessOptionsFor, nextAccess } from "./access";

describe("access", () => {
  it("reads the level from the provider mode", () => {
    expect(accessOf({ kind: "claude", modeId: "plan" })).toBe("plan");
    expect(accessOf({ kind: "claude", modeId: "bypassPermissions" })).toBe("full-auto");
    expect(accessOf({ kind: "claude", modeId: "default" })).toBe("auto");
    expect(accessOf({ kind: "codex", modeId: "full-access" })).toBe("full-auto");
    expect(accessOf({ kind: "codex", modeId: null })).toBe("auto");
  });

  it("offers each provider the levels it can switch to", () => {
    expect(accessOptionsFor("claude").map((o) => o.id)).toEqual(["plan", "auto", "full-auto"]);
    expect(accessOptionsFor("codex").map((o) => o.id)).toEqual(["auto", "full-auto"]);
    expect(accessOptionsFor("mock")).toEqual([]);
  });

  it("steps to the next level and wraps around", () => {
    const options = accessOptionsFor("claude");
    expect(nextAccess(options, "plan")).toBe("auto");
    expect(nextAccess(options, "full-auto")).toBe("plan");
  });
});
