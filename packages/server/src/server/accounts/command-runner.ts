import { execCommand } from "../../utils/spawn.js";

interface CommandResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export type CommandRunner = (
  binary: string,
  args: string[],
  options?: { timeoutMs?: number },
) => Promise<CommandResult>;

const DEFAULT_COMMAND_TIMEOUT_MS = 15_000;

interface ExecFailure {
  code?: number | string;
  stdout?: string;
  stderr?: string;
  message?: string;
}

export const runCommand: CommandRunner = async (binary, args, options) => {
  try {
    const { stdout, stderr } = await execCommand(binary, args, {
      timeout: options?.timeoutMs ?? DEFAULT_COMMAND_TIMEOUT_MS,
    });
    return { exitCode: 0, stdout, stderr };
  } catch (error) {
    const failure = error as ExecFailure;
    return {
      exitCode: typeof failure.code === "number" ? failure.code : 1,
      stdout: failure.stdout ?? "",
      stderr: failure.stderr ?? failure.message ?? "",
    };
  }
};
