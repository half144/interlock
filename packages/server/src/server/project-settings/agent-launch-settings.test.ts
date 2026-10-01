import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { AgentSessionConfig } from "../agent/agent-sdk-types.js";
import { applyProjectSettingsToAgentLaunch } from "./agent-launch-settings.js";
import { ProjectSettingsStore } from "./project-settings-store.js";

describe("applyProjectSettingsToAgentLaunch", () => {
  let home: string;
  const repoRoot = "/tmp/interlock-launch-settings-repo";

  beforeEach(() => {
    home = mkdtempSync(path.join(tmpdir(), "launch-settings-"));
  });

  afterEach(() => {
    rmSync(home, { recursive: true, force: true });
  });

  const baseConfig = (provider: string): AgentSessionConfig => ({
    provider,
    cwd: repoRoot,
  });

  it("uses auto mode by default for Claude and Codex", async () => {
    for (const provider of ["claude", "codex"]) {
      const { config } = await applyProjectSettingsToAgentLaunch({
        paseoHome: home,
        repoRoot,
        config: baseConfig(provider),
        env: undefined,
      });
      expect(config.modeId).toBe("auto");
    }
  });

  it("flows full-auto into the provider's unattended mode", async () => {
    await ProjectSettingsStore.forHome(home).update(repoRoot, { autonomy: "full-auto" });

    const claude = await applyProjectSettingsToAgentLaunch({
      paseoHome: home,
      repoRoot,
      config: baseConfig("claude"),
      env: undefined,
    });
    const codex = await applyProjectSettingsToAgentLaunch({
      paseoHome: home,
      repoRoot,
      config: baseConfig("codex"),
      env: undefined,
    });

    expect(claude.config.modeId).toBe("bypassPermissions");
    expect(codex.config.modeId).toBe("full-access");
  });

  it("merges project env under the request env and applies the default model for the default provider", async () => {
    await ProjectSettingsStore.forHome(home).update(repoRoot, {
      env: { API_URL: "http://localhost", SHARED: "project" },
      defaultProvider: "codex",
      defaultModel: "gpt-5",
    });

    const codex = await applyProjectSettingsToAgentLaunch({
      paseoHome: home,
      repoRoot,
      config: baseConfig("codex"),
      env: { SHARED: "request" },
    });
    const claude = await applyProjectSettingsToAgentLaunch({
      paseoHome: home,
      repoRoot,
      config: baseConfig("claude"),
      env: undefined,
    });

    expect(codex.env).toEqual({ API_URL: "http://localhost", SHARED: "request" });
    expect(codex.config.model).toBe("gpt-5");
    expect(claude.config.model).toBeUndefined();
  });
});
