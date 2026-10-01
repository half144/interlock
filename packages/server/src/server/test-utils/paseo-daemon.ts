import os from "node:os";
import path from "node:path";
import { mkdir, mkdtemp, rm } from "node:fs/promises";

import pino from "pino";
import { createPaseoDaemon, type PaseoDaemonConfig } from "../bootstrap.js";
import type { AgentClient, AgentProvider } from "../agent/agent-sdk-types.js";
import { createTestAgentClients } from "./fake-agent-client.js";

interface TestPaseoDaemonOptions {
  daemonVersion?: string;
  desktopManaged?: boolean;
  downloadTokenTtlMs?: number;
  corsAllowedOrigins?: string[];
  listen?: string;
  logger?: Parameters<typeof createPaseoDaemon>[1];
  isDev?: boolean;
  agentClients?: Partial<Record<AgentProvider, AgentClient>>;
  providerOverrides?: PaseoDaemonConfig["providerOverrides"];
  paseoHomeRoot?: string;
  cleanup?: boolean;
  auth?: PaseoDaemonConfig["auth"];
  trustedProxies?: PaseoDaemonConfig["trustedProxies"];
  autoArchiveAfterMerge?: boolean;
}

export interface TestPaseoDaemon {
  config: PaseoDaemonConfig;
  daemon: Awaited<ReturnType<typeof createPaseoDaemon>>;
  port: number;
  paseoHome: string;
  close: () => Promise<void>;
}

const TEST_DAEMON_START_TIMEOUT_MS = 20_000;

async function startDaemonWithTimeout(
  daemon: Awaited<ReturnType<typeof createPaseoDaemon>>,
  timeoutMs: number,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const timeoutHandle = setTimeout(() => {
      const timeoutError = new Error(
        `Timed out starting test daemon after ${timeoutMs}ms`,
      ) as Error & { code?: string };
      timeoutError.code = "TEST_DAEMON_START_TIMEOUT";
      reject(timeoutError);
    }, timeoutMs);

    daemon.start().then(
      () => {
        clearTimeout(timeoutHandle);
        resolve();
        return;
      },
      (error) => {
        clearTimeout(timeoutHandle);
        reject(error);
      },
    );
  });
}

export async function createTestPaseoDaemon(
  options: TestPaseoDaemonOptions = {},
): Promise<TestPaseoDaemon> {
  const maxAttempts = 8;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const { config, paseoHomeRoot, paseoHome } = await prepareTestDaemonConfig(options);
    const logger = options.logger ?? pino({ level: "silent" });
    const daemon = await createPaseoDaemon(config, logger);
    try {
      await startDaemonWithTimeout(daemon, TEST_DAEMON_START_TIMEOUT_MS);
      const listenTarget = daemon.getListenTarget();
      if (!listenTarget || listenTarget.type !== "tcp") {
        throw new Error("Test daemon did not expose a bound TCP listen target");
      }

      const close = async (): Promise<void> => {
        await daemon.stop().catch(() => undefined);
        await daemon.agentManager.flush().catch(() => undefined);
        if (options.cleanup ?? true) {
          await new Promise((r) => setTimeout(r, 50));
          await Promise.all([
            rm(paseoHomeRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }),
          ]);
        }
      };

      return {
        config,
        daemon,
        port: listenTarget.port,
        paseoHome,
        close,
      };
    } catch (error) {
      lastError = error;
      await daemon.stop().catch(() => undefined);
      await Promise.all([
        rm(paseoHomeRoot, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }),
      ]);

      if (
        (!isAddressInUseError(error) && !isStartupTimeoutError(error)) ||
        attempt === maxAttempts - 1
      ) {
        throw error;
      }
    }
  }

  throw lastError ?? new Error("Failed to start test daemon");
}

interface PreparedTestDaemonConfig {
  config: PaseoDaemonConfig;
  paseoHomeRoot: string;
  paseoHome: string;
}

async function prepareTestDaemonConfig(
  options: TestPaseoDaemonOptions,
): Promise<PreparedTestDaemonConfig> {
  const paseoHomeRoot =
    options.paseoHomeRoot ?? (await mkdtemp(path.join(os.tmpdir(), "interlock-home-")));
  const paseoHome = path.join(paseoHomeRoot, ".interlock");
  await mkdir(paseoHome, { recursive: true });
  const listenHost = options.listen ?? "127.0.0.1";
  const config: PaseoDaemonConfig = {
    listen: `${listenHost}:0`,
    paseoHome,
    daemonVersion: options.daemonVersion,
    desktopManaged: options.desktopManaged,
    corsAllowedOrigins: options.corsAllowedOrigins ?? [],
    hostnames: true,
    isDev: options.isDev,
    agentClients: options.agentClients ?? createTestAgentClients(),
    providerOverrides: options.providerOverrides,
    agentStoragePath: path.join(paseoHome, "agents"),
    auth: options.auth,
    trustedProxies: options.trustedProxies,
    downloadTokenTtlMs: options.downloadTokenTtlMs,
    autoArchiveAfterMerge: options.autoArchiveAfterMerge,
  };
  return { config, paseoHomeRoot, paseoHome };
}

function isAddressInUseError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const record = error as { code?: string };
  return record.code === "EADDRINUSE";
}

function isStartupTimeoutError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  const record = error as { code?: string };
  return record.code === "TEST_DAEMON_START_TIMEOUT";
}
