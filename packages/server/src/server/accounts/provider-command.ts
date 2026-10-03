import type { AuthProvider } from "@interlock/protocol/accounts-schema";
import type { MutableDaemonConfig } from "@interlock/protocol/messages";
import { ProviderOverrideSchema } from "@interlock/protocol/provider-config";
import { findExecutable } from "../../executable-resolution/executable-resolution.js";
import type { ProviderCommandPrefix } from "../agent/provider-launch-config.js";

export function configuredCommand(
  config: MutableDaemonConfig,
  provider: AuthProvider,
): string[] | undefined {
  return ProviderOverrideSchema.parse(config.providers[provider] ?? {}).command;
}

export async function resolveAccountCommand(
  provider: AuthProvider,
  argv: readonly string[] = [provider],
): Promise<ProviderCommandPrefix> {
  const executable = argv[0] ?? provider;
  const command = await findExecutable(executable);
  if (!command) {
    throw new Error(
      `Cannot run ${executable}. Choose an executable on your PATH or enter its full path in Accounts.`,
    );
  }
  return { command, args: argv.slice(1) };
}

export function displayCommand(argv: readonly string[]): string {
  return argv
    .map((arg) => (/^[\w./+:-]+$/u.test(arg) ? arg : `'${arg.replaceAll("'", "'\\''")}'`))
    .join(" ");
}
