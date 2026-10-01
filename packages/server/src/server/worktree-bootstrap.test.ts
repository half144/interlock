import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execFileSync } from "child_process";
import { mkdtempSync, realpathSync, rmSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

import type { AgentTimelineItem } from "./agent/agent-sdk-types.js";
import { runAsyncWorktreeBootstrap } from "./worktree-bootstrap.js";
import {
  createWorktree as createWorktreePrimitive,
  type WorktreeConfig,
} from "../utils/worktree.js";
import type { TerminalManager } from "../terminal/terminal-manager.js";
import type { TerminalSession } from "../terminal/terminal.js";

interface CreateAgentWorktreeTestOptions {
  cwd: string;
  branchName: string;
  baseBranch: string;
  worktreeSlug: string;
  paseoHome?: string;
}

interface CreateAgentWorktreeTestResult {
  worktree: WorktreeConfig;
  shouldBootstrap: boolean;
}

async function cleanupTerminalManager(terminalManager: TerminalManager): Promise<void> {
  const terminalsByCwd = await Promise.all(
    terminalManager.listDirectories().map((cwd) => terminalManager.getTerminals(cwd)),
  );
  const terminals = terminalsByCwd.flat();
  await Promise.all(terminals.map((terminal) => killTerminal(terminalManager, terminal)));
  terminalManager.killAll();
}

function killTerminal(terminalManager: TerminalManager, terminal: TerminalSession): Promise<void> {
  return terminalManager.killTerminalAndWait(terminal.id, {
    gracefulTimeoutMs: 100,
    forceTimeoutMs: 100,
  });
}

async function createBootstrapWorktreeForTest(
  options: CreateAgentWorktreeTestOptions,
): Promise<CreateAgentWorktreeTestResult> {
  const worktree = await createWorktreePrimitive({
    cwd: options.cwd,
    worktreeSlug: options.worktreeSlug,
    source: {
      kind: "branch-off",
      baseBranch: options.baseBranch,
      branchName: options.branchName,
    },
    runSetup: false,
    paseoHome: options.paseoHome,
  });
  return { worktree, shouldBootstrap: true };
}

describe("runAsyncWorktreeBootstrap", () => {
  let tempDir: string;
  let repoDir: string;
  let paseoHome: string;
  let realTerminalManagers: TerminalManager[];

  beforeEach(() => {
    realTerminalManagers = [];
    tempDir = realpathSync(mkdtempSync(join(tmpdir(), "worktree-bootstrap-test-")));
    repoDir = join(tempDir, "repo");
    paseoHome = join(tempDir, "paseo-home");

    mkdirSync(repoDir, { recursive: true });
    execFileSync("git", ["init", "-b", "main"], { cwd: repoDir, stdio: "pipe" });
    execFileSync("git", ["config", "user.email", "test@test.com"], { cwd: repoDir, stdio: "pipe" });
    execFileSync("git", ["config", "user.name", "Test"], { cwd: repoDir, stdio: "pipe" });
    writeFileSync(join(repoDir, "file.txt"), "hello\n");
    execFileSync("git", ["add", "."], { cwd: repoDir, stdio: "pipe" });
    execFileSync("git", ["-c", "commit.gpgsign=false", "commit", "-m", "initial"], {
      cwd: repoDir,
      stdio: "pipe",
    });
  });

  afterEach(async () => {
    await Promise.all(realTerminalManagers.map(cleanupTerminalManager));
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("does not fail setup when live timeline emission throws", async () => {
    writeFileSync(
      join(repoDir, "paseo.json"),
      JSON.stringify({
        worktree: {
          setup: ['echo "ok"'],
        },
      }),
    );
    execFileSync("git", ["add", "paseo.json"], { cwd: repoDir, stdio: "pipe" });
    execFileSync("git", ["-c", "commit.gpgsign=false", "commit", "-m", "add setup"], {
      cwd: repoDir,
      stdio: "pipe",
    });

    const worktreeBootstrap = await createBootstrapWorktreeForTest({
      cwd: repoDir,
      branchName: "feature-live-failure",
      baseBranch: "main",
      worktreeSlug: "feature-live-failure",
      paseoHome,
    });

    const persisted: AgentTimelineItem[] = [];
    await expect(
      runAsyncWorktreeBootstrap({
        agentId: "agent-live-failure",
        workspaceId: "ws-live-failure",
        worktree: worktreeBootstrap.worktree,
        shouldBootstrap: worktreeBootstrap.shouldBootstrap,
        terminalManager: null,
        appendTimelineItem: async (item) => {
          persisted.push(item);
          return true;
        },
        emitLiveTimelineItem: async () => {
          throw new Error("live emit failed");
        },
      }),
    ).resolves.toBeUndefined();

    const persistedSetupItems = persisted.filter(
      (item) => item.type === "tool_call" && item.name === "paseo_worktree_setup",
    );
    expect(persistedSetupItems).toHaveLength(1);
    if (persistedSetupItems[0]?.type === "tool_call") {
      expect(persistedSetupItems[0].status).toBe("completed");
    }
  });

  it("truncates each command output to 64kb in the middle", async () => {
    const largeOutputCommand =
      "node -e \"process.stdout.write('prefix-'); process.stdout.write('x'.repeat(70000)); process.stdout.write('-suffix')\"";
    writeFileSync(
      join(repoDir, "paseo.json"),
      JSON.stringify({
        worktree: {
          setup: [largeOutputCommand],
        },
      }),
    );
    execFileSync("git", ["add", "paseo.json"], { cwd: repoDir, stdio: "pipe" });
    execFileSync("git", ["-c", "commit.gpgsign=false", "commit", "-m", "add large output setup"], {
      cwd: repoDir,
      stdio: "pipe",
    });

    const worktreeBootstrap = await createBootstrapWorktreeForTest({
      cwd: repoDir,
      branchName: "feature-large-output",
      baseBranch: "main",
      worktreeSlug: "feature-large-output",
      paseoHome,
    });

    const persisted: AgentTimelineItem[] = [];
    await runAsyncWorktreeBootstrap({
      agentId: "agent-large-output",
      workspaceId: "ws-large-output",
      worktree: worktreeBootstrap.worktree,
      shouldBootstrap: worktreeBootstrap.shouldBootstrap,
      terminalManager: null,
      appendTimelineItem: async (item) => {
        persisted.push(item);
        return true;
      },
      emitLiveTimelineItem: async () => true,
    });

    const persistedSetupItem = persisted.find(
      (item): item is Extract<AgentTimelineItem, { type: "tool_call" }> =>
        item.type === "tool_call" && item.name === "paseo_worktree_setup",
    );
    expect(persistedSetupItem).toBeDefined();
    expect(persistedSetupItem?.detail.type).toBe("worktree_setup");
    if (!persistedSetupItem || persistedSetupItem.detail.type !== "worktree_setup") {
      throw new Error("Expected worktree_setup tool detail");
    }

    expect(persistedSetupItem.detail.truncated).toBe(true);
    expect(persistedSetupItem.detail.log).toContain("prefix-");
    expect(persistedSetupItem.detail.log).toContain("-suffix");
    expect(persistedSetupItem.detail.log).toContain("...<output truncated in the middle>...");
    expect(persistedSetupItem.detail.commands[0]?.log).toContain("prefix-");
    expect(persistedSetupItem.detail.commands[0]?.log).toContain("-suffix");
    expect(persistedSetupItem.detail.commands[0]?.log).toContain(
      "...<output truncated in the middle>...",
    );
  });

  it("waits for terminal output before sending bootstrap commands", async () => {
    writeFileSync(
      join(repoDir, "paseo.json"),
      JSON.stringify({
        worktree: {
          terminals: [
            {
              name: "Ready Terminal",
              command: "echo ready",
            },
          ],
        },
      }),
    );
    execFileSync("git", ["add", "paseo.json"], { cwd: repoDir, stdio: "pipe" });
    execFileSync(
      "git",
      ["-c", "commit.gpgsign=false", "commit", "-m", "add terminal bootstrap config"],
      {
        cwd: repoDir,
        stdio: "pipe",
      },
    );

    const worktreeBootstrap = await createBootstrapWorktreeForTest({
      cwd: repoDir,
      branchName: "feature-terminal-readiness",
      baseBranch: "main",
      worktreeSlug: "feature-terminal-readiness",
      paseoHome,
    });

    let readyAt = 0;
    let sendAt = 0;
    let outputListener: ((chunk: { data: string }) => void) | null = null;

    await runAsyncWorktreeBootstrap({
      agentId: "agent-terminal-readiness",
      workspaceId: "ws-terminal-readiness",
      worktree: worktreeBootstrap.worktree,
      shouldBootstrap: worktreeBootstrap.shouldBootstrap,
      terminalManager: {
        async getTerminals() {
          return [];
        },
        async createTerminal(options) {
          setTimeout(() => {
            readyAt = Date.now();
            outputListener?.({ data: "$ " });
          }, 25);
          return {
            id: "term-ready",
            name: options.name ?? "Terminal",
            cwd: options.cwd,
            send: () => {
              sendAt = Date.now();
            },
            subscribe: (listener) => {
              outputListener = (chunk) => listener({ type: "output", data: chunk.data });
              return () => {
                outputListener = null;
              };
            },
            onExit: () => () => {},
            onCommandFinished: () => () => {},
            onTitleChange: () => () => {},
            getSize: () => ({ rows: 0, cols: 0 }),
            getTitle: () => undefined,
            getExitInfo: () => null,
            getState: () => ({
              rows: 0,
              cols: 0,
              grid: [],
              scrollback: [],
              cursor: { row: 0, col: 0 },
            }),
            kill: () => {},
            killAndWait: async () => {},
          };
        },
        registerCwdEnv() {},
        getTerminal() {
          return undefined;
        },
        killTerminal() {},
        async killTerminalAndWait() {},
        listDirectories() {
          return [];
        },
        killAll() {},
        subscribeTerminalsChanged() {
          return () => {};
        },
      },
      appendTimelineItem: async () => true,
      emitLiveTimelineItem: async () => true,
    });

    expect(readyAt).toBeGreaterThan(0);
    expect(sendAt).toBeGreaterThan(0);
    expect(sendAt).toBeGreaterThanOrEqual(readyAt);
  });
});
