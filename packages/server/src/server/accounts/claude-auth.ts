import type { ChildProcess } from "node:child_process";
import { z } from "zod";
import { findExecutable } from "../../executable-resolution/executable-resolution.js";
import { spawnProcess } from "../../utils/spawn.js";
import { runCommand, type CommandRunner } from "./command-runner.js";

const URL_PATTERN = /https?:\/\/[^\s"'<>]+/u;
const URL_WAIT_MS = 4_000;
const LOGIN_TIMEOUT_MS = 10 * 60_000;
const OUTPUT_TAIL_BYTES = 2_000;

const ClaudeAuthStatusSchema = z.object({
  loggedIn: z.boolean(),
  email: z.string().nullish(),
  subscriptionType: z.string().nullish(),
});

export interface ClaudeAuthStatus {
  loggedIn: boolean;
  account: string | null;
  plan: string | null;
}

export interface ClaudeLoginResult {
  success: boolean;
  error: string | null;
}

export interface ClaudeLoginHandle {
  authUrl: string | null;
  done: Promise<ClaudeLoginResult>;
  cancel(): void;
}

export interface ClaudeAuthDeps {
  findBinary?: () => Promise<string | null>;
  run?: CommandRunner;
  spawn?: (binary: string, args: string[]) => ChildProcess;
}

export class ClaudeCliMissingError extends Error {
  constructor() {
    super(
      "Claude Code is not installed or not on the PATH. Install it with `curl -fsSL https://claude.ai/install.sh | bash`, then try again.",
    );
    this.name = "ClaudeCliMissingError";
  }
}

export class ClaudeAuth {
  private readonly findBinary: () => Promise<string | null>;
  private readonly run: CommandRunner;
  private readonly spawnChild: (binary: string, args: string[]) => ChildProcess;

  constructor(deps: ClaudeAuthDeps = {}) {
    this.findBinary = deps.findBinary ?? (() => findExecutable("claude"));
    this.run = deps.run ?? runCommand;
    this.spawnChild =
      deps.spawn ??
      ((binary, args) => spawnProcess(binary, args, { stdio: ["ignore", "pipe", "pipe"] }));
  }

  async status(): Promise<ClaudeAuthStatus> {
    const binary = await this.requireBinary();
    const result = await this.run(binary, ["auth", "status", "--json"]);
    const parsed = ClaudeAuthStatusSchema.safeParse(safeJson(result.stdout));
    if (!parsed.success) {
      return { loggedIn: false, account: null, plan: null };
    }
    return {
      loggedIn: parsed.data.loggedIn,
      account: parsed.data.email ?? null,
      plan: parsed.data.subscriptionType ?? null,
    };
  }

  async logout(): Promise<void> {
    const binary = await this.requireBinary();
    const result = await this.run(binary, ["auth", "logout"]);
    if (result.exitCode !== 0) {
      throw new Error(
        `Claude logout failed: ${tail(result.stderr || result.stdout)}. Run \`claude auth logout\` in a terminal to see the full error.`,
      );
    }
  }

  async startLogin(): Promise<ClaudeLoginHandle> {
    const binary = await this.requireBinary();
    const child = this.spawnChild(binary, ["auth", "login"]);
    let output = "";
    let resolveUrl: (url: string | null) => void = () => undefined;
    const urlFound = new Promise<string | null>((resolve) => {
      resolveUrl = resolve;
    });
    const collect = (chunk: Buffer | string) => {
      output += chunk.toString();
      const url = URL_PATTERN.exec(output)?.[0];
      if (url) resolveUrl(url);
    };
    child.stdout?.on("data", collect);
    child.stderr?.on("data", collect);

    const done = new Promise<ClaudeLoginResult>((resolve) => {
      const timeout = setTimeout(() => {
        child.kill();
        resolve({ success: false, error: "Claude login timed out. Start it again." });
      }, LOGIN_TIMEOUT_MS);
      child.once("error", (error) => {
        clearTimeout(timeout);
        resolve({ success: false, error: `Could not run claude: ${error.message}` });
      });
      child.once("exit", (code) => {
        clearTimeout(timeout);
        resolveUrl(null);
        void this.confirmLogin(code, output).then(resolve);
      });
    });

    const authUrl = await Promise.race([urlFound, delay(URL_WAIT_MS)]);
    return { authUrl, done, cancel: () => child.kill() };
  }

  private async confirmLogin(code: number | null, output: string): Promise<ClaudeLoginResult> {
    if (code !== 0) {
      return {
        success: false,
        error: `Claude login did not finish (${tail(output) || `exit code ${code ?? "unknown"}`}). Try again, or run \`claude auth login\` in a terminal.`,
      };
    }
    const status = await this.status();
    return status.loggedIn
      ? { success: true, error: null }
      : {
          success: false,
          error: "Claude login finished but `claude auth status` still reports logged out.",
        };
  }

  private async requireBinary(): Promise<string> {
    const binary = await this.findBinary();
    if (!binary) throw new ClaudeCliMissingError();
    return binary;
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function tail(text: string): string {
  return text.trim().slice(-OUTPUT_TAIL_BYTES);
}

function delay(ms: number): Promise<null> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), ms).unref();
  });
}
