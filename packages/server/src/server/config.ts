import path from "node:path";
import { resolvePaseoNodeEnv } from "./paseo-env.js";
import type { z } from "zod";
import { expandTilde } from "../utils/path.js";

import type { PaseoDaemonConfig } from "./bootstrap.js";
import {
  loadPersistedConfig,
  LogFormatSchema,
  LogLevelSchema,
  type PersistedConfig,
} from "./persisted-config.js";
import type {
  AgentProviderRuntimeSettingsMap,
  ProviderOverride,
} from "./agent/provider-launch-config.js";
import { ProviderOverrideSchema } from "./agent/provider-launch-config.js";
import { AgentProviderSchema } from "@interlock/protocol/provider-manifest";
import { hashDaemonPassword } from "./auth.js";
import { mergeHostnames, parseHostnamesEnv, type HostnamesConfig } from "./hostnames.js";
import { resolveGitProcessPolicy } from "../utils/git-process-scheduler.js";

const DEFAULT_PORT = 6868;
const DEFAULT_TRUSTED_PROXIES = ["loopback"];

function normalizeLogEnv(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return value.trim().toLowerCase();
}

function resolveGitProcessConfig(
  env: NodeJS.ProcessEnv,
  persisted: ReturnType<typeof loadPersistedConfig>,
): NonNullable<PaseoDaemonConfig["git"]> {
  return resolveGitProcessPolicy({
    env,
    persisted: persisted.daemon?.git,
  });
}

export type CliConfigOverrides = Partial<{
  listen: string;
  hostnames: HostnamesConfig;
}>;

type TrustedProxiesConfig = true | string[];

function resolveLogConfigFromEnv(
  env: NodeJS.ProcessEnv,
  persisted: PersistedConfig,
): PersistedConfig["log"] {
  const level = parseLogLevelEnv(env.INTERLOCK_LOG_LEVEL ?? env.INTERLOCK_LOG);
  const format = parseLogFormatEnv(env.INTERLOCK_LOG_FORMAT);
  const console = resolveConsoleLogConfigFromEnv(env, persisted.log?.console);
  const file = resolveFileLogConfigFromEnv(env, persisted.log?.file);

  if (level === undefined && format === undefined && !console && !file) {
    return persisted.log;
  }

  return {
    ...persisted.log,
    ...(level !== undefined ? { level } : {}),
    ...(format !== undefined ? { format } : {}),
    ...(console ? { console } : {}),
    ...(file ? { file } : {}),
  };
}

function resolveConsoleLogConfigFromEnv(
  env: NodeJS.ProcessEnv,
  persisted: NonNullable<PersistedConfig["log"]>["console"],
): NonNullable<PersistedConfig["log"]>["console"] {
  const level = parseLogLevelEnv(env.INTERLOCK_LOG_CONSOLE_LEVEL);
  const format = parseLogFormatEnv(env.INTERLOCK_LOG_CONSOLE_FORMAT);
  if (level === undefined && format === undefined) return undefined;
  return {
    ...persisted,
    ...(level !== undefined ? { level } : {}),
    ...(format !== undefined ? { format } : {}),
  };
}

function resolveFileLogConfigFromEnv(
  env: NodeJS.ProcessEnv,
  persisted: NonNullable<PersistedConfig["log"]>["file"],
): NonNullable<PersistedConfig["log"]>["file"] {
  const level = parseLogLevelEnv(env.INTERLOCK_LOG_FILE_LEVEL);
  const filePath = nonEmptyEnv(env.INTERLOCK_LOG_FILE_PATH);
  const maxSize = nonEmptyEnv(env.INTERLOCK_LOG_FILE_ROTATE_SIZE);
  const maxFiles = parsePositiveIntegerEnv(env.INTERLOCK_LOG_FILE_ROTATE_COUNT);
  const hasRotateOverride = maxSize !== undefined || maxFiles !== undefined;
  if (level === undefined && filePath === undefined && !hasRotateOverride) return undefined;
  return {
    ...persisted,
    ...(level !== undefined ? { level } : {}),
    ...(filePath !== undefined ? { path: filePath } : {}),
    ...(hasRotateOverride
      ? {
          rotate: {
            ...persisted?.rotate,
            ...(maxSize !== undefined ? { maxSize } : {}),
            ...(maxFiles !== undefined ? { maxFiles } : {}),
          },
        }
      : {}),
  };
}

function parseLogLevelEnv(value: string | undefined): z.infer<typeof LogLevelSchema> | undefined {
  const parsed = LogLevelSchema.safeParse(normalizeLogEnv(value));
  return parsed.success ? parsed.data : undefined;
}

function parseLogFormatEnv(value: string | undefined): z.infer<typeof LogFormatSchema> | undefined {
  const parsed = LogFormatSchema.safeParse(normalizeLogEnv(value));
  return parsed.success ? parsed.data : undefined;
}

function nonEmptyEnv(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function parsePositiveIntegerEnv(value: string | undefined): number | undefined {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function extractProviderOverrides(
  providers: Record<string, unknown> | undefined,
): Record<string, ProviderOverride> | undefined {
  if (!providers) {
    return undefined;
  }

  const providerOverrides = Object.entries(providers).flatMap(([providerId, provider]) => {
    const parsed = ProviderOverrideSchema.safeParse(provider);
    return parsed.success ? [[providerId, parsed.data] as const] : [];
  });

  return providerOverrides.length > 0 ? Object.fromEntries(providerOverrides) : undefined;
}

function extractAgentProviderSettings(
  providerOverrides: Record<string, ProviderOverride> | undefined,
): AgentProviderRuntimeSettingsMap | undefined {
  if (!providerOverrides) {
    return undefined;
  }

  const runtimeSettings = Object.entries(providerOverrides).flatMap(([providerId, provider]) => {
    const parsedProviderId = AgentProviderSchema.safeParse(providerId);
    if (!parsedProviderId.success || (!provider.command && !provider.env)) {
      return [];
    }

    return [
      [
        parsedProviderId.data,
        {
          command: provider.command
            ? {
                mode: "replace" as const,
                argv: provider.command,
              }
            : undefined,
          env: provider.env,
        },
      ] as const,
    ];
  });

  return runtimeSettings.length > 0
    ? (Object.fromEntries(runtimeSettings) as AgentProviderRuntimeSettingsMap)
    : undefined;
}

function resolveCorsAllowedOrigins(
  env: NodeJS.ProcessEnv,
  persisted: ReturnType<typeof loadPersistedConfig>,
): string[] {
  const envCorsOrigins = env.INTERLOCK_CORS_ORIGINS
    ? env.INTERLOCK_CORS_ORIGINS.split(",").map((s) => s.trim())
    : [];
  const persistedCorsOrigins = persisted.daemon?.cors?.allowedOrigins ?? [];
  return Array.from(
    new Set([...persistedCorsOrigins, ...envCorsOrigins].filter((s) => s.length > 0)),
  );
}

function parseTrustedProxiesEnv(value: string | undefined): TrustedProxiesConfig | undefined {
  const trimmed = value?.trim();
  if (!trimmed) {
    return undefined;
  }

  const normalized = trimmed.toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }
  if (["0", "false", "no", "off"].includes(normalized)) {
    return [];
  }

  return trimmed
    .split(",")
    .map((proxy) => proxy.trim())
    .filter((proxy) => proxy.length > 0);
}

function resolveTrustedProxiesConfig(
  env: NodeJS.ProcessEnv,
  persisted: ReturnType<typeof loadPersistedConfig>,
): TrustedProxiesConfig {
  return (
    parseTrustedProxiesEnv(env.INTERLOCK_TRUSTED_PROXIES) ??
    persisted.daemon?.trustedProxies ??
    DEFAULT_TRUSTED_PROXIES
  );
}

// INTERLOCK_LISTEN can be:
// - host:port (TCP)
// - /path/to/socket (Unix socket)
// - unix:///path/to/socket (Unix socket)
// Default is TCP at 127.0.0.1:6868
function resolveListenAddress(
  env: NodeJS.ProcessEnv,
  cli: CliConfigOverrides | undefined,
  persisted: ReturnType<typeof loadPersistedConfig>,
): string {
  return (
    cli?.listen ??
    env.INTERLOCK_LISTEN ??
    persisted.daemon?.listen ??
    `127.0.0.1:${env.PORT ?? DEFAULT_PORT}`
  );
}

function resolveAuthConfig(
  env: NodeJS.ProcessEnv,
  persisted: ReturnType<typeof loadPersistedConfig>,
): PaseoDaemonConfig["auth"] {
  const envPassword = (env.INTERLOCK_TOKEN ?? env.INTERLOCK_PASSWORD)?.trim();
  if (envPassword) {
    return { password: hashDaemonPassword(envPassword) };
  }
  return persisted.daemon?.auth?.password
    ? { password: persisted.daemon.auth.password }
    : undefined;
}

function resolveWorktreesRoot(
  paseoHome: string,
  persisted: ReturnType<typeof loadPersistedConfig>,
): string | undefined {
  const configuredRoot = persisted.worktrees?.root?.trim();
  if (!configuredRoot) {
    return undefined;
  }

  const expandedRoot = expandTilde(configuredRoot);
  return path.isAbsolute(expandedRoot)
    ? path.resolve(expandedRoot)
    : path.resolve(paseoHome, expandedRoot);
}

function resolveAppendSystemPrompt(persisted: ReturnType<typeof loadPersistedConfig>): string {
  return persisted.daemon?.appendSystemPrompt ?? "";
}

function resolveStaticLoadConfigSettings(
  env: NodeJS.ProcessEnv,
  cli: CliConfigOverrides | undefined,
  persisted: ReturnType<typeof loadPersistedConfig>,
) {
  return {
    autoArchiveAfterMerge: persisted.daemon?.autoArchiveAfterMerge ?? false,
    appendSystemPrompt: resolveAppendSystemPrompt(persisted),
    terminalProfiles: persisted.daemon?.terminalProfiles,
    hostnames: mergeHostnames([
      persisted.daemon?.hostnames,
      parseHostnamesEnv(env.INTERLOCK_HOSTNAMES ?? env.INTERLOCK_ALLOWED_HOSTS),
      cli?.hostnames,
    ]),
    trustedProxies: resolveTrustedProxiesConfig(env, persisted),
  };
}

interface ResolveConfigFromPersistedOptions {
  env?: NodeJS.ProcessEnv;
  cli?: CliConfigOverrides;
}

export function resolveConfigFromPersisted(
  paseoHome: string,
  persisted: PersistedConfig,
  options?: ResolveConfigFromPersistedOptions,
): PaseoDaemonConfig {
  const resolvedOptions = options ?? {};
  const env = resolvedOptions.env ?? process.env;
  const cli = resolvedOptions.cli;

  const listen = resolveListenAddress(env, cli, persisted);
  const { autoArchiveAfterMerge, appendSystemPrompt, terminalProfiles, hostnames, trustedProxies } =
    resolveStaticLoadConfigSettings(env, cli, persisted);

  const providerOverrides = extractProviderOverrides(
    persisted.agents?.providers as Record<string, unknown> | undefined,
  );

  const overrideControlledPaths = resolveOverrideControlledPaths(env, cli);

  return {
    listen,
    paseoHome,
    desktopManaged: env.INTERLOCK_DESKTOP_MANAGED === "1",
    worktreesRoot: resolveWorktreesRoot(paseoHome, persisted),
    corsAllowedOrigins: resolveCorsAllowedOrigins(env, persisted),
    hostnames,
    trustedProxies,
    git: resolveGitProcessConfig(env, persisted),
    autoArchiveAfterMerge,
    appendSystemPrompt,
    terminalProfiles,
    isDev: resolvePaseoNodeEnv(env) === "development",
    agentStoragePath: path.join(paseoHome, "agents"),
    agentClients: {},
    auth: resolveAuthConfig(env, persisted),
    agentProviderSettings: extractAgentProviderSettings(providerOverrides),
    providerCatalogRefreshTimeoutMs: persisted.agents?.catalogRefreshTimeoutMs,
    metadataGeneration: persisted.agents?.metadataGeneration,
    providerOverrides,
    log: resolveLogConfigFromEnv(env, persisted),
    configReload: {
      env: { ...env },
      cli: cli ? { ...cli } : undefined,
      overrideControlledPaths,
      startupPersisted: persisted,
    },
  };
}

export function loadConfig(
  paseoHome: string,
  options?: ResolveConfigFromPersistedOptions,
): PaseoDaemonConfig {
  const persisted = loadPersistedConfig(paseoHome);
  return resolveConfigFromPersisted(paseoHome, persisted, options);
}

function parsePositiveGitOverride(value: string | undefined): boolean {
  if (value === undefined) return false;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0;
}

function resolveOverrideControlledPaths(
  env: NodeJS.ProcessEnv,
  cli: CliConfigOverrides | undefined,
): string[] {
  return Array.from(
    new Set([
      ...resolveDaemonOverrideControlledPaths(env, cli),
      ...resolveLogOverrideControlledPaths(env),
    ]),
  ).sort();
}

function resolveDaemonOverrideControlledPaths(
  env: NodeJS.ProcessEnv,
  cli: CliConfigOverrides | undefined,
): string[] {
  return [...resolveCoreDaemonOverridePaths(env, cli)];
}

function resolveCoreDaemonOverridePaths(
  env: NodeJS.ProcessEnv,
  cli: CliConfigOverrides | undefined,
): string[] {
  const paths: string[] = [];
  if (cli?.listen !== undefined || env.INTERLOCK_LISTEN !== undefined) {
    paths.push("daemon.listen");
  }
  // Hostname sources append instead of replacing one another, so a launch value
  // does not prevent a persisted hostname edit from taking effect.
  if (parseTrustedProxiesEnv(env.INTERLOCK_TRUSTED_PROXIES) !== undefined) {
    paths.push("daemon.trustedProxies");
  }
  if (parsePositiveGitOverride(env.INTERLOCK_GIT_MAX_PROCESSES_PER_SECOND)) {
    paths.push("daemon.git.maxProcessesPerSecond");
  }
  if (
    parsePositiveGitOverride(
      env.INTERLOCK_GIT_MAX_PROCESS_CONCURRENCY ?? env.INTERLOCK_GIT_CONCURRENCY,
    )
  ) {
    paths.push("daemon.git.maxProcessConcurrency");
  }
  if ((env.INTERLOCK_TOKEN ?? env.INTERLOCK_PASSWORD)?.trim()) paths.push("daemon.auth.password");
  return paths;
}

function resolveLogOverrideControlledPaths(env: NodeJS.ProcessEnv): string[] {
  const paths: string[] = [];
  if (parseLogLevelEnv(env.INTERLOCK_LOG_LEVEL ?? env.INTERLOCK_LOG) !== undefined) {
    paths.push("log.level");
  }
  if (parseLogFormatEnv(env.INTERLOCK_LOG_FORMAT) !== undefined) paths.push("log.format");
  if (parseLogLevelEnv(env.INTERLOCK_LOG_CONSOLE_LEVEL) !== undefined) {
    paths.push("log.console.level");
  }
  if (parseLogFormatEnv(env.INTERLOCK_LOG_CONSOLE_FORMAT) !== undefined) {
    paths.push("log.console.format");
  }
  if (parseLogLevelEnv(env.INTERLOCK_LOG_FILE_LEVEL) !== undefined) paths.push("log.file.level");
  if (nonEmptyEnv(env.INTERLOCK_LOG_FILE_PATH) !== undefined) paths.push("log.file.path");
  if (nonEmptyEnv(env.INTERLOCK_LOG_FILE_ROTATE_SIZE) !== undefined) {
    paths.push("log.file.rotate.maxSize");
  }
  if (parsePositiveIntegerEnv(env.INTERLOCK_LOG_FILE_ROTATE_COUNT) !== undefined) {
    paths.push("log.file.rotate.maxFiles");
  }
  return paths;
}
