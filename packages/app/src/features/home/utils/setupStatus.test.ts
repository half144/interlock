import { describe, expect, it } from "vitest";
import type { ProviderUsage, ToolStatus } from "@/types";
import { setupStatus } from "./setupStatus";

const tool = (id: ToolStatus["id"], change: Partial<ToolStatus> = {}): ToolStatus => ({
  id,
  executable: id,
  path: null,
  installed: true,
  version: "1.0.0",
  loggedIn: true,
  account: null,
  plan: null,
  installCommand: null,
  loginCommand: null,
  ...change,
});

const usage = (kind: ProviderUsage["kind"], plan: string): ProviderUsage => ({
  kind,
  label: kind,
  status: "available",
  plan,
  windows: [],
  balances: [],
  error: null,
});

const all = [tool("git"), tool("claude"), tool("codex"), tool("gh")];

describe("setupStatus", () => {
  it("says what is ready when nothing is left to do", () => {
    expect(setupStatus(all, [])).toMatchObject({
      text: "Claude Code, Codex and GitHub ready",
      ready: true,
    });
    const claudeOnly = [tool("claude"), tool("codex", { installed: false }), tool("gh")];
    expect(setupStatus(claudeOnly, []).text).toBe("Claude Code and GitHub ready");
  });

  it("asks for the next step: a signed-out agent first, then the GitHub CLI", () => {
    const codexOut = [
      tool("claude"),
      tool("codex", { loggedIn: false }),
      tool("gh", { installed: false }),
    ];
    expect(setupStatus(codexOut, [])).toMatchObject({ text: "Sign in to Codex", ready: false });
    expect(setupStatus([tool("claude"), tool("gh", { installed: false })], []).text).toBe(
      "Install the GitHub CLI to open pull requests",
    );
    expect(setupStatus([tool("claude"), tool("gh", { loggedIn: false })], []).text).toBe(
      "Sign in to the GitHub CLI to open pull requests",
    );
  });

  it("marks Claude, Codex and GitHub, with the plan usage reports", () => {
    const tools = [
      tool("git"),
      tool("claude", { plan: "max" }),
      tool("codex", { loggedIn: false }),
      tool("gh"),
    ];
    expect(setupStatus(tools, [usage("claude", "Max 20x")]).marks).toEqual([
      { id: "claude", ready: true, title: "Claude Code · Max 20x · ready" },
      { id: "codex", ready: false, title: "Codex · signed out" },
      { id: "gh", ready: true, title: "GitHub CLI · ready" },
    ]);
  });
});
