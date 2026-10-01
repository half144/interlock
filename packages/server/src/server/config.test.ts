import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test } from "vitest";

import { loadConfig } from "./config.js";

const roots: string[] = [];

async function createHome(): Promise<string> {
  const home = await mkdtemp(path.join(os.tmpdir(), "interlock-config-"));
  roots.push(home);
  return home;
}

describe("server config", () => {
  afterEach(async () => {
    await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
  });

  test("records when the daemon is managed by the desktop shell", async () => {
    const home = await createHome();

    const desktopConfig = loadConfig(home, { env: { INTERLOCK_DESKTOP_MANAGED: "1" } });
    const standaloneConfig = loadConfig(home, { env: {} });

    expect(desktopConfig.desktopManaged).toBe(true);
    expect(standaloneConfig.desktopManaged).toBe(false);
  });

  test("listens on 127.0.0.1:6868 by default", async () => {
    const config = loadConfig(await createHome(), { env: {} });

    expect(config.listen).toBe("127.0.0.1:6868");
  });

  test("loads the provider catalog refresh timeout", async () => {
    const home = await createHome();
    await writeFile(
      path.join(home, "config.json"),
      JSON.stringify({ agents: { catalogRefreshTimeoutMs: 180_000 } }),
    );

    const config = loadConfig(home, { env: {} });

    expect(config.providerCatalogRefreshTimeoutMs).toBe(180_000);
  });

  test("records launch overrides by persisted leaf", async () => {
    const config = loadConfig(await createHome(), {
      env: {
        INTERLOCK_LISTEN: "127.0.0.1:7000",
        INTERLOCK_TOKEN: "secret",
        INTERLOCK_TRUSTED_PROXIES: "true",
        INTERLOCK_LOG_FILE_PATH: "custom.log",
      },
    });

    expect(config.configReload?.overrideControlledPaths).toEqual([
      "daemon.auth.password",
      "daemon.listen",
      "daemon.trustedProxies",
      "log.file.path",
    ]);
    expect(config.listen).toBe("127.0.0.1:7000");
    expect(config.trustedProxies).toBe(true);
    expect(config.log?.file?.path).toBe("custom.log");
  });
});
