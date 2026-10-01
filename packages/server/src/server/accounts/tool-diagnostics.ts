import type { Logger } from "pino";
import type { ToolDiagnostic, DiagnosticToolId } from "@interlock/protocol/accounts-schema";
import { findExecutable } from "../../executable-resolution/executable-resolution.js";
import type { ClaudeAuth } from "./claude-auth.js";
import type { CodexAuth } from "./codex-auth.js";
import { runCommand, type CommandRunner } from "./command-runner.js";

interface ToolCatalogEntry {
  installCommand: string;
  loginCommand: string | null;
}

const TOOL_CATALOG: Record<DiagnosticToolId, ToolCatalogEntry> = {
  git: { installCommand: "xcode-select --install", loginCommand: null },
  claude: {
    installCommand: "curl -fsSL https://claude.ai/install.sh | bash",
    loginCommand: "claude auth login",
  },
  codex: { installCommand: "npm install -g @openai/codex", loginCommand: "codex login" },
  gh: { installCommand: "brew install gh", loginCommand: "gh auth login" },
};

const TOOL_ORDER: readonly DiagnosticToolId[] = ["git", "claude", "codex", "gh"];
const VERSION_PATTERN = /\d+\.\d+(?:\.\d+)?(?:[-+][\w.]+)?/u;

export interface ToolDiagnosticsDeps {
  logger: Logger;
  claudeAuth: Pick<ClaudeAuth, "status">;
  codexAuth: Pick<CodexAuth, "status">;
  findBinary?: (name: string) => Promise<string | null>;
  run?: CommandRunner;
}

interface LoginProbe {
  loggedIn: boolean | null;
  account: string | null;
  plan: string | null;
}

const UNKNOWN_LOGIN: LoginProbe = { loggedIn: null, account: null, plan: null };

export async function collectToolDiagnostics(deps: ToolDiagnosticsDeps): Promise<ToolDiagnostic[]> {
  const findBinary = deps.findBinary ?? findExecutable;
  const run = deps.run ?? runCommand;
  return Promise.all(
    TOOL_ORDER.map(async (id) => {
      const path = await findBinary(id);
      const catalog = TOOL_CATALOG[id];
      const base = {
        id,
        path,
        installCommand: path ? null : catalog.installCommand,
        loginCommand: catalog.loginCommand,
      };
      if (!path) {
        return { ...base, installed: false, version: null, ...UNKNOWN_LOGIN };
      }
      const [version, login] = await Promise.all([
        readVersion(run, path),
        probeLogin(id, path, deps, run),
      ]);
      return { ...base, installed: true, version, ...login };
    }),
  );
}

async function readVersion(run: CommandRunner, binary: string): Promise<string | null> {
  const result = await run(binary, ["--version"]);
  return result.exitCode === 0 ? (VERSION_PATTERN.exec(result.stdout)?.[0] ?? null) : null;
}

async function probeLogin(
  id: DiagnosticToolId,
  binary: string,
  deps: ToolDiagnosticsDeps,
  run: CommandRunner,
): Promise<LoginProbe> {
  switch (id) {
    case "git":
      return UNKNOWN_LOGIN;
    case "claude":
      return deps.claudeAuth
        .status()
        .catch((error: unknown) => unknownLogin(deps.logger, id, error));
    case "codex":
      return deps.codexAuth
        .status()
        .catch((error: unknown) => unknownLogin(deps.logger, id, error));
    case "gh":
      return probeGh(run, binary);
  }
}

function unknownLogin(logger: Logger, id: DiagnosticToolId, error: unknown): LoginProbe {
  logger.warn({ err: error, tool: id }, "Login status probe failed");
  return UNKNOWN_LOGIN;
}

// `gh auth status` exits 1 when any stored account is broken, even while the active one works,
// so the active account decides.
async function probeGh(run: CommandRunner, binary: string): Promise<LoginProbe> {
  const result = await run(binary, ["auth", "status"]);
  const account = parseActiveGhAccount(`${result.stdout}\n${result.stderr}`);
  return { loggedIn: account !== null, account, plan: null };
}

export function parseActiveGhAccount(output: string): string | null {
  const lines = output.split(/\r?\n/u);
  let first: string | null = null;
  let current: string | null = null;
  for (const line of lines) {
    const account = /Logged in to \S+ account (\S+)/u.exec(line)?.[1];
    if (account) {
      current = account;
      first ??= account;
    } else if (/Failed to log in to \S+ account/u.test(line)) {
      current = null;
    } else if (/Active account:\s*true/u.test(line)) {
      return current;
    }
  }
  return first;
}
