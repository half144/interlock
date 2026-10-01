import { describe, expect, it } from "vitest";
import type { Logger } from "pino";
import type { CommandRunner } from "./command-runner.js";
import { collectToolDiagnostics, parseActiveGhAccount } from "./tool-diagnostics.js";

const logger = { warn: () => undefined } as unknown as Logger;

const installed: Record<string, string> = {
  git: "/usr/bin/git",
  claude: "/bin/claude",
  codex: "/bin/codex",
  gh: "/bin/gh",
};

const versions: Record<string, string> = {
  "/usr/bin/git": "git version 2.50.1 (Apple Git-155)",
  "/bin/claude": "2.1.286 (Claude Code)",
  "/bin/codex": "codex-cli 0.159.2",
  "/bin/gh": "gh version 2.63.2 (2024-12-05)",
};

const run: CommandRunner = async (binary, args) => {
  if (args[0] === "--version") return { exitCode: 0, stdout: versions[binary] ?? "", stderr: "" };
  return {
    exitCode: 0,
    stdout:
      "github.com\n  ✓ Logged in to github.com account octo (keyring)\n  - Active account: true\n",
    stderr: "",
  };
};

describe("collectToolDiagnostics", () => {
  it("reports version, login and account for every installed tool", async () => {
    const tools = await collectToolDiagnostics({
      logger,
      claudeAuth: { status: async () => ({ loggedIn: true, account: "a@b.c", plan: "max" }) },
      codexAuth: { status: async () => ({ loggedIn: false, account: null, plan: null }) },
      findBinary: async (name) => installed[name] ?? null,
      run,
    });

    expect(tools.map((tool) => tool.id)).toEqual(["git", "claude", "codex", "gh"]);
    expect(tools.find((tool) => tool.id === "git")).toMatchObject({
      installed: true,
      version: "2.50.1",
      loggedIn: null,
      installCommand: null,
    });
    expect(tools.find((tool) => tool.id === "claude")).toMatchObject({
      version: "2.1.286",
      loggedIn: true,
      account: "a@b.c",
      plan: "max",
    });
    expect(tools.find((tool) => tool.id === "codex")).toMatchObject({
      version: "0.159.2",
      loggedIn: false,
      loginCommand: "codex login",
    });
    expect(tools.find((tool) => tool.id === "gh")).toMatchObject({
      loggedIn: true,
      account: "octo",
    });
  });

  it("gives the install command for a missing tool and skips its probes", async () => {
    const tools = await collectToolDiagnostics({
      logger,
      claudeAuth: {
        status: async () => {
          throw new Error("must not run");
        },
      },
      codexAuth: {
        status: async () => {
          throw new Error("must not run");
        },
      },
      findBinary: async (name) => (name === "git" ? "/usr/bin/git" : null),
      run,
    });

    const claude = tools.find((tool) => tool.id === "claude");
    expect(claude).toMatchObject({
      installed: false,
      version: null,
      loggedIn: null,
      installCommand: "curl -fsSL https://claude.ai/install.sh | bash",
    });
  });

  it("marks login unknown when a login probe throws", async () => {
    const tools = await collectToolDiagnostics({
      logger,
      claudeAuth: {
        status: async () => {
          throw new Error("spawn failed");
        },
      },
      codexAuth: { status: async () => ({ loggedIn: true, account: null, plan: null }) },
      findBinary: async (name) => installed[name] ?? null,
      run,
    });

    expect(tools.find((tool) => tool.id === "claude")).toMatchObject({
      installed: true,
      loggedIn: null,
    });
  });

  it("reports gh as logged out when auth status fails", async () => {
    const tools = await collectToolDiagnostics({
      logger,
      claudeAuth: { status: async () => ({ loggedIn: false, account: null, plan: null }) },
      codexAuth: { status: async () => ({ loggedIn: false, account: null, plan: null }) },
      findBinary: async (name) => installed[name] ?? null,
      run: async (binary, args) =>
        args[0] === "auth"
          ? { exitCode: 1, stdout: "", stderr: "You are not logged in" }
          : run(binary, args),
    });

    expect(tools.find((tool) => tool.id === "gh")).toMatchObject({
      loggedIn: false,
      loginCommand: "gh auth login",
    });
  });
});

describe("parseActiveGhAccount", () => {
  it("picks the account marked active when several are logged in", () => {
    const output = [
      "github.com",
      "  ✓ Logged in to github.com account first (keyring)",
      "  - Active account: false",
      "  ✓ Logged in to github.com account second (keyring)",
      "  - Active account: true",
    ].join("\n");

    expect(parseActiveGhAccount(output)).toBe("second");
  });
});
