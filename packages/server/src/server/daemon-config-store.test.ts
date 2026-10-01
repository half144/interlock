import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";

import { DaemonConfigStore, applyMutableProviderConfigToOverrides } from "./daemon-config-store.js";
import { loadPersistedConfig } from "./persisted-config.js";
import type { PersistedConfig } from "./persisted-config.js";
import type { MutableDaemonConfig } from "@interlock/protocol/messages";

function reloadableConfig(persisted: PersistedConfig): MutableDaemonConfig {
  const daemon = persisted.daemon ?? {};
  const git = daemon.git ?? {};
  const agents = persisted.agents ?? {};
  return {
    providers: (agents.providers ?? {}) as MutableDaemonConfig["providers"],
    metadataGeneration: { providers: agents.metadataGeneration?.providers ?? [] },
    autoArchiveAfterMerge: daemon.autoArchiveAfterMerge ?? false,
    appendSystemPrompt: daemon.appendSystemPrompt ?? "",
    terminalProfiles: daemon.terminalProfiles,
    cors: { allowedOrigins: [] },
    trustedProxies: ["loopback"],
    git: {
      maxProcessesPerSecond: git.maxProcessesPerSecond ?? 64,
      maxProcessConcurrency: git.maxProcessConcurrency ?? 8,
    },
  };
}

describe("applyMutableProviderConfigToOverrides", () => {
  test("merges mutable provider fields onto provider overrides", () => {
    expect(
      applyMutableProviderConfigToOverrides(
        {
          gemini: {
            extends: "acp",
            label: "Gemini",
            command: ["gemini", "--acp"],
          },
        },
        {
          gemini: {
            enabled: false,
            description: "Gemini ACP",
            env: { GEMINI_AUTO_UPDATE: "0" },
          },
          claude: {
            additionalModels: [
              {
                id: "claude-custom",
                label: "claude-custom",
              },
            ],
          },
        },
      ),
    ).toEqual({
      gemini: {
        extends: "acp",
        label: "Gemini",
        description: "Gemini ACP",
        command: ["gemini", "--acp"],
        env: { GEMINI_AUTO_UPDATE: "0" },
        enabled: false,
      },
      claude: {
        additionalModels: [
          {
            id: "claude-custom",
            label: "claude-custom",
          },
        ],
      },
    });
  });
});

describe("DaemonConfigStore", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs) {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test("rolls back config when a field transition fails", () => {
    const paseoHome = mkdtempSync(path.join(tmpdir(), "interlock-daemon-config-store-"));
    tempDirs.push(paseoHome);
    const store = new DaemonConfigStore(paseoHome, {
      providers: {},
      metadataGeneration: { providers: [] },
      autoArchiveAfterMerge: false,
      appendSystemPrompt: "",
    });
    store.onFieldChange("autoArchiveAfterMerge", (enabled) => {
      if (enabled === true) {
        throw new Error("Auto-archive failed to start");
      }
    });

    expect(() => store.patch({ autoArchiveAfterMerge: true })).toThrow(
      "Auto-archive failed to start",
    );
    expect(store.get().autoArchiveAfterMerge).toBe(false);
    expect(loadPersistedConfig(paseoHome).daemon?.autoArchiveAfterMerge).toBeUndefined();
  });

  test("rolls back live owners when a later transactional owner fails", () => {
    const paseoHome = mkdtempSync(path.join(tmpdir(), "interlock-daemon-config-store-"));
    tempDirs.push(paseoHome);
    const store = new DaemonConfigStore(paseoHome, {
      providers: {},
      metadataGeneration: { providers: [] },
      autoArchiveAfterMerge: false,
      appendSystemPrompt: "",
    });
    let autoArchive = false;
    store.onApply((next, previous) => {
      autoArchive = next.autoArchiveAfterMerge;
      return () => {
        autoArchive = previous.autoArchiveAfterMerge;
      };
    });
    store.onApply(() => {
      throw new Error("Provider refresh failed");
    });

    expect(() => store.patch({ autoArchiveAfterMerge: true })).toThrow("Provider refresh failed");
    expect(autoArchive).toBe(false);
    expect(store.get().autoArchiveAfterMerge).toBe(false);
    expect(loadPersistedConfig(paseoHome).daemon?.autoArchiveAfterMerge).toBeUndefined();
  });

  test("unrelated patches persist only requested file intent", () => {
    const paseoHome = mkdtempSync(path.join(tmpdir(), "paseo-daemon-config-store-"));
    tempDirs.push(paseoHome);
    const before = loadPersistedConfig(paseoHome);
    const store = new DaemonConfigStore(
      paseoHome,
      {
        hostnames: ["launch.example.test"],
        cors: { allowedOrigins: ["https://launch.example.test"] },
        trustedProxies: true,
        git: { maxProcessesPerSecond: 7, maxProcessConcurrency: 2 },
        catalogRefreshTimeoutMs: 9_000,
        providers: {},
        metadataGeneration: { providers: [] },
        autoArchiveAfterMerge: false,
        appendSystemPrompt: "",
      },
      undefined,
    );

    store.patch({
      appendSystemPrompt: "Only this field",
      // Reload-only runtime state is accepted as unknown wire data for forward
      // compatibility but is not part of the patch capability.
      hostnames: ["attempted-patch.example.test"],
    } as Parameters<typeof store.patch>[0]);

    expect(store.get().hostnames).toEqual(["launch.example.test"]);
    expect(loadPersistedConfig(paseoHome)).toEqual({
      ...before,
      daemon: { ...before.daemon, appendSystemPrompt: "Only this field" },
    });
  });

  test("patch persists provider enabled flags into config.json", () => {
    const paseoHome = mkdtempSync(path.join(tmpdir(), "paseo-daemon-config-store-"));
    tempDirs.push(paseoHome);

    const initial = loadPersistedConfig(paseoHome);
    const configPath = path.join(paseoHome, "config.json");
    // Reuse the validated serializer through the store path by seeding the file directly.
    // This keeps the test focused on the merge behavior.
    const seeded =
      JSON.stringify(
        {
          ...initial,
          agents: {
            providers: {
              gemini: {
                extends: "acp",
                label: "Gemini",
                command: ["gemini", "--acp"],
              },
            },
          },
        },
        null,
        2,
      ) + "\n";
    writeFileSync(configPath, seeded);

    const store = new DaemonConfigStore(
      paseoHome,
      {
        providers: {},
        metadataGeneration: { providers: [] },
        autoArchiveAfterMerge: false,
        appendSystemPrompt: "",
      },
      undefined,
    );

    store.patch({
      providers: {
        gemini: { enabled: false },
      },
    });

    const persisted = loadPersistedConfig(paseoHome);
    expect(persisted.agents?.providers?.gemini).toEqual({
      extends: "acp",
      label: "Gemini",
      command: ["gemini", "--acp"],
      enabled: false,
    });
  });

  test("patch removes provider entries from config.json", () => {
    const paseoHome = mkdtempSync(path.join(tmpdir(), "paseo-daemon-config-store-"));
    tempDirs.push(paseoHome);

    const configPath = path.join(paseoHome, "config.json");
    writeFileSync(
      configPath,
      `${JSON.stringify(
        {
          version: 1,
          agents: {
            providers: {
              gemini: {
                extends: "acp",
                label: "Gemini",
                command: ["gemini", "--acp"],
              },
              claude: {
                enabled: false,
              },
            },
          },
        },
        null,
        2,
      )}\n`,
    );

    const store = new DaemonConfigStore(
      paseoHome,
      {
        providers: {
          gemini: {},
          claude: { enabled: false },
        },
        metadataGeneration: { providers: [] },
        autoArchiveAfterMerge: false,
        appendSystemPrompt: "",
      },
      undefined,
    );

    const next = store.patch({ removeProviders: ["gemini"] });

    expect(next.providers.gemini).toBeUndefined();
    expect(next.providers.claude).toEqual({ enabled: false });
    const persisted = loadPersistedConfig(paseoHome);
    expect(persisted.agents?.providers?.gemini).toBeUndefined();
    expect(persisted.agents?.providers?.claude).toEqual({ enabled: false });
  });

  test("patch removes the providers object when the last provider is deleted", () => {
    const paseoHome = mkdtempSync(path.join(tmpdir(), "paseo-daemon-config-store-"));
    tempDirs.push(paseoHome);

    const configPath = path.join(paseoHome, "config.json");
    writeFileSync(
      configPath,
      `${JSON.stringify(
        {
          version: 1,
          agents: {
            providers: {
              gemini: {
                extends: "acp",
                label: "Gemini",
                command: ["gemini", "--acp"],
              },
            },
          },
        },
        null,
        2,
      )}\n`,
    );

    const store = new DaemonConfigStore(
      paseoHome,
      {
        providers: { gemini: {} },
        metadataGeneration: { providers: [] },
        autoArchiveAfterMerge: false,
        appendSystemPrompt: "",
      },
      undefined,
    );

    store.patch({ removeProviders: ["gemini"] });

    const persisted = loadPersistedConfig(paseoHome);
    expect(persisted.agents?.providers).toBeUndefined();
  });

  test("patch removes deleted providers from metadata generation", () => {
    const paseoHome = mkdtempSync(path.join(tmpdir(), "paseo-daemon-config-store-"));
    tempDirs.push(paseoHome);

    const configPath = path.join(paseoHome, "config.json");
    writeFileSync(
      configPath,
      `${JSON.stringify(
        {
          version: 1,
          agents: {
            providers: {
              gemini: {
                extends: "acp",
                label: "Gemini",
                command: ["gemini", "--acp"],
              },
              claude: {
                enabled: false,
              },
            },
            metadataGeneration: {
              providers: [
                { provider: "gemini", model: "flash" },
                { provider: "claude", model: "haiku" },
              ],
            },
          },
        },
        null,
        2,
      )}\n`,
    );

    const store = new DaemonConfigStore(
      paseoHome,
      {
        providers: {
          gemini: {},
          claude: { enabled: false },
        },
        metadataGeneration: {
          providers: [
            { provider: "gemini", model: "flash" },
            { provider: "claude", model: "haiku" },
          ],
        },
        autoArchiveAfterMerge: false,
        appendSystemPrompt: "",
      },
      undefined,
    );

    const next = store.patch({ removeProviders: ["gemini"] });

    expect(next.metadataGeneration.providers).toEqual([{ provider: "claude", model: "haiku" }]);
    const persisted = loadPersistedConfig(paseoHome);
    expect(persisted.agents?.metadataGeneration).toEqual({
      providers: [{ provider: "claude", model: "haiku" }],
    });
  });

  test("patch persists provider removal when in-memory config is already clean", () => {
    const paseoHome = mkdtempSync(path.join(tmpdir(), "paseo-daemon-config-store-"));
    tempDirs.push(paseoHome);

    const configPath = path.join(paseoHome, "config.json");
    writeFileSync(
      configPath,
      `${JSON.stringify(
        {
          version: 1,
          agents: {
            providers: {
              gemini: {
                extends: "acp",
                label: "Gemini",
                command: ["gemini", "--acp"],
              },
            },
            metadataGeneration: {
              providers: [{ provider: "gemini", model: "flash" }],
            },
          },
        },
        null,
        2,
      )}\n`,
    );

    const store = new DaemonConfigStore(
      paseoHome,
      {
        providers: {},
        metadataGeneration: { providers: [] },
        autoArchiveAfterMerge: false,
        appendSystemPrompt: "",
      },
      undefined,
    );

    const next = store.patch({ removeProviders: ["gemini"] });

    expect(next.providers.gemini).toBeUndefined();
    const persisted = loadPersistedConfig(paseoHome);
    expect(persisted.agents?.providers).toBeUndefined();
    expect(persisted.agents?.metadataGeneration).toEqual({ providers: [] });
  });

  test("patch persists append system prompt into config.json", () => {
    const paseoHome = mkdtempSync(path.join(tmpdir(), "paseo-daemon-config-store-"));
    tempDirs.push(paseoHome);

    const store = new DaemonConfigStore(
      paseoHome,
      {
        providers: {},
        metadataGeneration: { providers: [] },
        autoArchiveAfterMerge: false,
        appendSystemPrompt: "",
      },
      undefined,
    );

    store.patch({
      appendSystemPrompt: "Prefer terse replies.",
    });

    const persisted = loadPersistedConfig(paseoHome);
    expect(persisted.daemon?.appendSystemPrompt).toBe("Prefer terse replies.");
  });

  test("patch persists provider additional models into config.json", () => {
    const paseoHome = mkdtempSync(path.join(tmpdir(), "paseo-daemon-config-store-"));
    tempDirs.push(paseoHome);

    const store = new DaemonConfigStore(
      paseoHome,
      {
        providers: {},
        metadataGeneration: { providers: [] },
        autoArchiveAfterMerge: false,
        appendSystemPrompt: "",
      },
      undefined,
    );

    store.patch({
      providers: {
        claude: {
          additionalModels: [
            {
              id: "claude-custom",
              label: "claude-custom",
            },
          ],
        },
      },
    });

    const persisted = loadPersistedConfig(paseoHome);
    expect(persisted.agents?.providers?.claude).toEqual({
      additionalModels: [
        {
          id: "claude-custom",
          label: "claude-custom",
        },
      ],
    });
  });

  test("patch persists daemon append system prompt into config.json", () => {
    const paseoHome = mkdtempSync(path.join(tmpdir(), "paseo-daemon-config-store-"));
    tempDirs.push(paseoHome);

    const store = new DaemonConfigStore(
      paseoHome,
      {
        providers: {},
        metadataGeneration: { providers: [] },
        autoArchiveAfterMerge: false,
        appendSystemPrompt: "",
      },
      undefined,
    );

    store.patch({
      appendSystemPrompt: "Prefer terse replies.",
    });

    const persisted = loadPersistedConfig(paseoHome);
    expect(persisted.daemon?.appendSystemPrompt).toBe("Prefer terse replies.");
  });

  test("patch persists metadata generation providers into config.json", () => {
    const paseoHome = mkdtempSync(path.join(tmpdir(), "paseo-daemon-config-store-"));
    tempDirs.push(paseoHome);

    const store = new DaemonConfigStore(
      paseoHome,
      {
        providers: {},
        metadataGeneration: { providers: [] },
        autoArchiveAfterMerge: false,
        appendSystemPrompt: "",
      },
      undefined,
    );

    store.patch({
      metadataGeneration: {
        providers: [
          { provider: "claude", model: "haiku" },
          { provider: "codex", model: "gpt-5.4-mini", thinkingOptionId: "low" },
        ],
      },
    });

    const persisted = loadPersistedConfig(paseoHome);
    expect(persisted.agents?.metadataGeneration).toEqual({
      providers: [
        { provider: "claude", model: "haiku" },
        { provider: "codex", model: "gpt-5.4-mini", thinkingOptionId: "low" },
      ],
    });
  });

  test("patch persists clearing metadata generation providers into config.json", () => {
    const paseoHome = mkdtempSync(path.join(tmpdir(), "paseo-daemon-config-store-"));
    tempDirs.push(paseoHome);

    const configPath = path.join(paseoHome, "config.json");
    writeFileSync(
      configPath,
      `${JSON.stringify(
        {
          version: 1,
          agents: {
            metadataGeneration: {
              providers: [{ provider: "claude", model: "haiku" }],
            },
          },
        },
        null,
        2,
      )}\n`,
    );

    const store = new DaemonConfigStore(
      paseoHome,
      {
        providers: {},
        autoArchiveAfterMerge: false,
        appendSystemPrompt: "",
        metadataGeneration: { providers: [{ provider: "claude", model: "haiku" }] },
      },
      undefined,
    );

    store.patch({ metadataGeneration: { providers: [] } });

    const persisted = loadPersistedConfig(paseoHome);
    expect(persisted.agents?.metadataGeneration).toEqual({ providers: [] });
  });
});

describe("DaemonConfigStore reload", () => {
  const tempDirs: string[] = [];

  afterEach(() => {
    for (const dir of tempDirs) rmSync(dir, { recursive: true, force: true });
  });

  function createReloadableStore(
    options: {
      overrideControlledPaths?: string[];
      initialPersisted?: PersistedConfig;
    } = {},
  ) {
    const paseoHome = mkdtempSync(path.join(tmpdir(), "interlock-daemon-config-reload-"));
    tempDirs.push(paseoHome);
    if (options.initialPersisted) {
      writeFileSync(
        path.join(paseoHome, "config.json"),
        `${JSON.stringify(options.initialPersisted, null, 2)}\n`,
      );
    }
    const persisted = loadPersistedConfig(paseoHome);
    const initialMutable = reloadableConfig(persisted);
    const store = new DaemonConfigStore(paseoHome, initialMutable, undefined, {
      reloadSource: {
        resolve: (nextPersisted) => {
          const mutable = reloadableConfig(nextPersisted);
          if (options.overrideControlledPaths?.includes("daemon.autoArchiveAfterMerge")) {
            mutable.autoArchiveAfterMerge = initialMutable.autoArchiveAfterMerge;
          }
          return {
            mutable,
            overrideControlledPaths: options.overrideControlledPaths ?? [],
          };
        },
      },
    });
    return { paseoHome, store, persisted };
  }

  function writeConfig(paseoHome: string, config: unknown): void {
    writeFileSync(path.join(paseoHome, "config.json"), `${JSON.stringify(config, null, 2)}\n`);
  }

  test("applies mutable edits and reports startup-only edits", () => {
    const { paseoHome, store, persisted } = createReloadableStore();
    writeConfig(paseoHome, {
      ...persisted,
      daemon: {
        ...persisted.daemon,
        listen: "127.0.0.1:7777",
        autoArchiveAfterMerge: true,
        git: { maxProcessesPerSecond: 12, maxProcessConcurrency: 3 },
      },
    });

    expect(store.reload()).toEqual({
      appliedPaths: [
        "daemon.autoArchiveAfterMerge",
        "daemon.git.maxProcessConcurrency",
        "daemon.git.maxProcessesPerSecond",
      ],
      restartRequiredPaths: ["daemon.listen"],
      overrideControlledPaths: [],
    });
    expect(store.get().autoArchiveAfterMerge).toBe(true);
    expect(store.get().git).toEqual({ maxProcessesPerSecond: 12, maxProcessConcurrency: 3 });
  });

  test("classifies every leaf when the daemon subtree is removed", () => {
    const { paseoHome, store } = createReloadableStore({
      initialPersisted: {
        version: 1,
        daemon: { listen: "127.0.0.1:7777", autoArchiveAfterMerge: true },
      },
    });
    writeConfig(paseoHome, { version: 1 });

    expect(store.reload()).toEqual({
      appliedPaths: ["daemon.autoArchiveAfterMerge"],
      restartRequiredPaths: ["daemon.listen"],
      overrideControlledPaths: [],
    });
    expect(store.get().autoArchiveAfterMerge).toBe(false);
  });

  test("keeps overridden leaves separate from restart-required siblings", () => {
    const { paseoHome, store } = createReloadableStore({
      initialPersisted: { version: 1 },
      overrideControlledPaths: ["daemon.autoArchiveAfterMerge"],
    });
    writeConfig(paseoHome, {
      version: 1,
      daemon: { listen: "127.0.0.1:7777", autoArchiveAfterMerge: true },
    });

    expect(store.reload()).toEqual({
      appliedPaths: [],
      restartRequiredPaths: ["daemon.listen"],
      overrideControlledPaths: ["daemon.autoArchiveAfterMerge"],
    });
  });

  test("invalid JSON and invalid schema apply nothing", () => {
    const { paseoHome, store } = createReloadableStore();
    writeFileSync(path.join(paseoHome, "config.json"), "{ nope\n");
    expect(() => store.reload()).toThrow("Invalid JSON");
    expect(store.get().autoArchiveAfterMerge).toBe(false);

    writeConfig(paseoHome, { daemon: { autoArchiveAfterMerge: "yes" } });
    expect(() => store.reload()).toThrow("Invalid config");
    expect(store.get().autoArchiveAfterMerge).toBe(false);
  });

  test("removing providers and optional profiles clears live state", () => {
    const { paseoHome, store, persisted } = createReloadableStore();
    writeConfig(paseoHome, {
      ...persisted,
      daemon: {
        ...persisted.daemon,
        terminalProfiles: [{ id: "shell", name: "Shell", command: "bash" }],
      },
      agents: {
        providers: {
          claude: { label: "Claude (custom)" },
        },
      },
    });
    store.reload();

    writeConfig(paseoHome, persisted);
    const result = store.reload();

    expect(result.appliedPaths).toEqual(["agents.providers", "daemon.terminalProfiles"]);
    expect(store.get().providers).toEqual({});
    expect(store.get().terminalProfiles).toBeUndefined();
  });

  test("reports a launch-controlled edit without changing live state", () => {
    const { paseoHome, store, persisted } = createReloadableStore({
      overrideControlledPaths: ["daemon.autoArchiveAfterMerge"],
    });
    writeConfig(paseoHome, {
      ...persisted,
      daemon: { ...persisted.daemon, autoArchiveAfterMerge: true },
    });

    expect(store.reload()).toEqual({
      appliedPaths: [],
      restartRequiredPaths: [],
      overrideControlledPaths: ["daemon.autoArchiveAfterMerge"],
    });
    expect(store.get().autoArchiveAfterMerge).toBe(false);
  });

  test("an unrelated patch does not mark a manual override-owned edit as applied", () => {
    const { paseoHome, store, persisted } = createReloadableStore({
      overrideControlledPaths: ["daemon.autoArchiveAfterMerge"],
    });
    writeConfig(paseoHome, {
      ...persisted,
      daemon: { ...persisted.daemon, autoArchiveAfterMerge: true },
    });
    store.patch({ appendSystemPrompt: "patched elsewhere" });

    expect(store.reload()).toEqual({
      appliedPaths: [],
      restartRequiredPaths: [],
      overrideControlledPaths: ["daemon.autoArchiveAfterMerge"],
    });
  });

  test("reports startup-only launch overrides instead of restart warnings", () => {
    const { paseoHome, store, persisted } = createReloadableStore({
      overrideControlledPaths: ["daemon.listen"],
    });
    writeConfig(paseoHome, {
      ...persisted,
      daemon: { ...persisted.daemon, listen: "127.0.0.1:7777" },
    });

    expect(store.reload()).toEqual({
      appliedPaths: [],
      restartRequiredPaths: [],
      overrideControlledPaths: ["daemon.listen"],
    });
  });

  test("a no-op reload returns empty path lists", () => {
    const { store } = createReloadableStore();
    expect(store.reload()).toEqual({
      appliedPaths: [],
      restartRequiredPaths: [],
      overrideControlledPaths: [],
    });
  });
});
