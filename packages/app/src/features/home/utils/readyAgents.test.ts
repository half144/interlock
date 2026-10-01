import { describe, expect, it } from "vitest";
import type { ProviderUsage, ToolStatus } from "@/types";
import { readyAgents } from "./readyAgents";

const tool = (id: ToolStatus["id"], change: Partial<ToolStatus> = {}): ToolStatus => ({
  id,
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

describe("readyAgents", () => {
  it("keeps only the agents that are installed and signed in", () => {
    const tools = [tool("git"), tool("claude"), tool("codex", { loggedIn: false }), tool("gh")];
    expect(readyAgents(tools, []).map((a) => a.kind)).toEqual(["claude"]);
    expect(readyAgents([tool("codex", { loggedIn: null })], [])).toEqual([]);
    expect(readyAgents([tool("codex", { installed: false })], [])).toEqual([]);
  });

  it("names the plan from usage, falling back to what the login reported", () => {
    const tools = [tool("claude", { plan: "max" }), tool("codex")];
    expect(readyAgents(tools, [usage("claude", "Max 20x")])).toEqual([
      { kind: "claude", label: "Claude Code", plan: "Max 20x" },
      { kind: "codex", label: "Codex", plan: null },
    ]);
    expect(readyAgents(tools, [])[0]?.plan).toBe("max");
  });
});
