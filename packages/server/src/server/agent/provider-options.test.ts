import { describe, expect, test } from "vitest";
import { z } from "zod";

import { validateProviderOptions } from "./provider-options.js";
import { applyClaudeToolPolicy, ClaudeProviderOptionsSchema } from "./providers/claude/options.js";
import { applyCodexToolPolicy, CodexProviderOptionsSchema } from "./providers/codex/options.js";

const hubPolicy = {
  preapproved: [{ kind: "mcp" as const, server: "hub", tool: "finish_execution" }],
};

describe("provider-owned option schemas", () => {
  test("accepts Codex native workspace-write and network policy nesting", () => {
    expect(
      CodexProviderOptionsSchema.parse({
        approval_policy: "never",
        sandbox_mode: "workspace-write",
        sandbox_workspace_write: {
          writable_roots: ["/var/cache/npm"],
          network_access: false,
        },
        web_search: "disabled",
        features: {
          network_proxy: {
            enabled: true,
            domains: { "registry.npmjs.org": "allow", "*": "deny" },
          },
        },
      }),
    ).toMatchObject({
      sandbox_workspace_write: { writable_roots: ["/var/cache/npm"] },
    });
  });

  test("reports the exact invalid Codex option path", () => {
    expect(() =>
      validateProviderOptions("codex", CodexProviderOptionsSchema, {
        sandbox_workspace_write: { writable_roots: ["/tmp", 42] },
      }),
    ).toThrow("providerOptions.sandbox_workspace_write.writable_roots[1]");
  });

  test("accepts Claude permission and fail-closed sandbox settings", () => {
    expect(
      ClaudeProviderOptionsSchema.parse({
        allowedTools: ["Read"],
        disallowedTools: ["Bash(rm *)"],
        sandbox: {
          enabled: true,
          failIfUnavailable: true,
          filesystem: { denyRead: ["~/.ssh/**"] },
          network: {
            allowedDomains: ["api.anthropic.com"],
            allowLocalBinding: false,
            allowUnixSockets: ["/var/run/docker.sock"],
          },
        },
        settings: { permissions: { ask: ["Bash(*)"], deny: ["Edit(.env)"] } },
      }),
    ).toMatchObject({ sandbox: { enabled: true, failIfUnavailable: true } });
  });

  test("reports the exact invalid Claude option path", () => {
    expect(() =>
      validateProviderOptions("claude", ClaudeProviderOptionsSchema, {
        sandbox: { network: { allowLocalBinding: "yes" } },
      }),
    ).toThrow("providerOptions.sandbox.network.allowLocalBinding");
  });

  test.each([
    ["codex", CodexProviderOptionsSchema, { cwd: "/tmp" }],
    ["claude", ClaudeProviderOptionsSchema, { hooks: {} }],
  ])("rejects Paseo-owned or executable %s keys", (provider, schema, options) => {
    expect(() => validateProviderOptions(provider, schema, options)).toThrow(
      `Invalid providerOptions for '${provider}'`,
    );
  });

  test("all schemas reject non-JSON values", () => {
    const unsafe = { approval_policy: () => true };
    expect(z.json().safeParse(unsafe).success).toBe(false);
    expect(CodexProviderOptionsSchema.safeParse(unsafe).success).toBe(false);
  });
});

describe("exact MCP preapproval mappings", () => {
  test("Codex enables and approves only the granted server tool", () => {
    expect(
      applyCodexToolPolicy(
        {
          mcp_servers: {
            hub: { url: "http://127.0.0.1/hub" },
            unrelated: { url: "http://127.0.0.1/unrelated" },
          },
        },
        hubPolicy,
      ),
    ).toEqual({
      mcp_servers: {
        hub: {
          url: "http://127.0.0.1/hub",
          enabled_tools: ["finish_execution"],
          default_tools_approval_mode: "prompt",
          tools: { finish_execution: { approval_mode: "approve" } },
        },
        unrelated: { url: "http://127.0.0.1/unrelated" },
      },
    });
  });

  test("Claude adds the exact MCP identity without replacing deny rules", () => {
    expect(
      applyClaudeToolPolicy(
        { allowedTools: ["Read"], disallowedTools: ["Bash", "mcp__hub__reply"] },
        hubPolicy,
      ),
    ).toEqual({
      allowedTools: ["Read", "mcp__hub__finish_execution"],
      disallowedTools: ["Bash", "mcp__hub__reply"],
    });
  });
});
