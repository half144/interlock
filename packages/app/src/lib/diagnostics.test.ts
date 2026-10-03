import { describe, expect, it } from "vitest";
import type { ToolStatus } from "@/types";
import { finishLogin, needsSetup, stateOf } from "./diagnostics";

const tool = (id: ToolStatus["id"], patch: Partial<ToolStatus> = {}): ToolStatus => ({
  id,
  executable: id,
  path: null,
  installed: true,
  version: "1",
  loggedIn: true,
  account: null,
  plan: null,
  installCommand: null,
  loginCommand: null,
  ...patch,
});

describe("needsSetup", () => {
  it("is false when git and one logged-in agent are there", () => {
    const tools = [tool("git"), tool("claude"), tool("codex", { installed: false })];
    expect(needsSetup(tools)).toBe(false);
  });

  it("is true without git, or when no agent can run", () => {
    expect(needsSetup([tool("git", { installed: false }), tool("claude")])).toBe(true);
    expect(
      needsSetup([
        tool("git"),
        tool("claude", { loggedIn: false }),
        tool("codex", { loggedIn: null }),
      ]),
    ).toBe(true);
  });
});

describe("stateOf", () => {
  it("tells missing, signed-out and ready apart", () => {
    expect(stateOf(tool("codex", { installed: false }))).toBe("missing");
    expect(stateOf(tool("codex", { loggedIn: false }))).toBe("needs-login");
    expect(stateOf(tool("gh", { loggedIn: null }))).toBe("ready");
  });
});

describe("finishLogin", () => {
  const waiting = { phase: "waiting", provider: "codex", loginId: "l1", authUrl: null } as const;

  it("ends the wait on success and fails with the daemon's message otherwise", () => {
    const done = { provider: "codex", loginId: "l1" } as const;
    expect(finishLogin(waiting, { ...done, success: true, error: null })).toEqual({
      phase: "idle",
    });
    expect(finishLogin(waiting, { ...done, success: false, error: "Timed out" })).toEqual({
      phase: "failed",
      provider: "codex",
      message: "Timed out",
    });
  });

  it("ignores a login that was cancelled or is not the current one", () => {
    const done = { provider: "codex", success: true, error: null } as const;
    expect(finishLogin({ phase: "idle" }, { ...done, loginId: "l1" })).toEqual({ phase: "idle" });
    expect(finishLogin(waiting, { ...done, loginId: "other" })).toBe(waiting);
  });
});
