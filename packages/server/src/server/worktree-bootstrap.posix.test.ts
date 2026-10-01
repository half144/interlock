// POSIX-only: worktree setup shell and terminal service fixtures

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { execFileSync } from "child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
  mkdirSync,
} from "fs";
import { join } from "path";
import { tmpdir } from "os";
import type { AgentTimelineItem } from "./agent/agent-sdk-types.js";
import { runAsyncWorktreeBootstrap } from "./worktree-bootstrap.js";
import { isPlatform } from "../test-utils/platform.js";
import {
  createWorktree as createWorktreePrimitive,
  type WorktreeConfig,
} from "../utils/worktree.js";
import { ProjectSettingsStore } from "./project-settings/project-settings-store.js";
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

describe.skipIf(isPlatform("win32"))("worktree-bootstrap POSIX-only", () => {
  describe("runAsyncWorktreeBootstrap", () => {
    let tempDir: string;
    let repoDir: string;
    let paseoHome: string;
    let realTerminalManagers: TerminalManager[];

    async function waitForPathExists(targetPath: string, timeoutMs = 10000): Promise<void> {
      const startedAt = Date.now();
      while (Date.now() - startedAt < timeoutMs) {
        if (existsSync(targetPath)) {
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
      throw new Error(`Timed out waiting for path: ${targetPath}`);
    }

    beforeEach(() => {
      realTerminalManagers = [];
      tempDir = realpathSync(mkdtempSync(join(tmpdir(), "worktree-bootstrap-test-")));
      repoDir = join(tempDir, "repo");
      paseoHome = join(tempDir, "paseo-home");

      mkdirSync(repoDir, { recursive: true });
      execFileSync("git", ["init", "-b", "main"], { cwd: repoDir, stdio: "pipe" });
      execFileSync("git", ["config", "user.email", "test@test.com"], {
        cwd: repoDir,
        stdio: "pipe",
      });
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
    it("streams running setup updates live and persists only a final setup timeline row", async () => {
      await ProjectSettingsStore.forHome(paseoHome).update(repoDir, {
        setupCommands: ['echo "line-one"; echo "line-two" 1>&2', 'echo "line-three"'],
      });

      const worktreeBootstrap = await createBootstrapWorktreeForTest({
        cwd: repoDir,
        branchName: "feature-streaming-setup",
        baseBranch: "main",
        worktreeSlug: "feature-streaming-setup",
        paseoHome,
      });

      const persisted: AgentTimelineItem[] = [];
      const live: AgentTimelineItem[] = [];

      await runAsyncWorktreeBootstrap({
        repoRoot: repoDir,
        paseoHome,
        agentId: "agent-test",
        workspaceId: "ws-agent-test",
        worktree: worktreeBootstrap.worktree,
        shouldBootstrap: worktreeBootstrap.shouldBootstrap,
        terminalManager: null,
        appendTimelineItem: async (item) => {
          persisted.push(item);
          return true;
        },
        emitLiveTimelineItem: async (item: AgentTimelineItem) => {
          live.push(item);
          return true;
        },
      });

      const liveSetupItems = live.filter(
        (item) =>
          item.type === "tool_call" &&
          item.name === "paseo_worktree_setup" &&
          item.status === "running",
      );
      expect(liveSetupItems.length).toBeGreaterThan(0);

      const persistedSetupItems = persisted.filter(
        (item) => item.type === "tool_call" && item.name === "paseo_worktree_setup",
      );
      expect(persistedSetupItems).toHaveLength(1);
      expect(persistedSetupItems[0]?.type).toBe("tool_call");
      if (persistedSetupItems[0]?.type === "tool_call") {
        expect(persistedSetupItems[0].status).toBe("completed");
        expect(persistedSetupItems[0].detail.type).toBe("worktree_setup");

        if (persistedSetupItems[0].detail.type === "worktree_setup") {
          expect(persistedSetupItems[0].detail.log).toContain(
            '==> [1/2] Running: echo "line-one"; echo "line-two" 1>&2',
          );
          expect(persistedSetupItems[0].detail.log).toContain("line-one");
          expect(persistedSetupItems[0].detail.log).toContain("line-two");
          expect(persistedSetupItems[0].detail.log).toContain(
            '==> [2/2] Running: echo "line-three"',
          );
          expect(persistedSetupItems[0].detail.log).toContain("line-three");
          expect(persistedSetupItems[0].detail.log).toMatch(/<== \[1\/2\] Exit 0 in \d+\.\d{2}s/);
          expect(persistedSetupItems[0].detail.log).toMatch(/<== \[2\/2\] Exit 0 in \d+\.\d{2}s/);

          expect(persistedSetupItems[0].detail.commands).toHaveLength(2);
          expect(persistedSetupItems[0].detail.commands[0]).toMatchObject({
            index: 1,
            command: 'echo "line-one"; echo "line-two" 1>&2',
            log: expect.stringContaining("line-one"),
            status: "completed",
            exitCode: 0,
          });
          expect(persistedSetupItems[0].detail.commands[0]?.log).toContain("line-two");
          expect(persistedSetupItems[0].detail.commands[1]).toMatchObject({
            index: 2,
            command: 'echo "line-three"',
            log: "line-three\n",
            status: "completed",
            exitCode: 0,
          });
          expect(typeof persistedSetupItems[0].detail.commands[0]?.durationMs === "number").toBe(
            true,
          );
          expect(typeof persistedSetupItems[0].detail.commands[1]?.durationMs === "number").toBe(
            true,
          );
        }
      }

      const liveCallIds = new Set(
        liveSetupItems
          .filter(
            (item): item is Extract<AgentTimelineItem, { type: "tool_call" }> =>
              item.type === "tool_call",
          )
          .map((item) => item.callId),
      );
      expect(liveCallIds.size).toBe(1);
      if (persistedSetupItems[0]?.type === "tool_call") {
        expect(liveCallIds.has(persistedSetupItems[0].callId)).toBe(true);
      }
    });

    it("keeps only the final carriage-return-updated content in command logs", async () => {
      await ProjectSettingsStore.forHome(paseoHome).update(repoDir, {
        setupCommands: [
          `node -e "process.stdout.write('fetch 1/3\\\\rfetch 2/3\\\\rfetch 3/3\\\\nready\\\\n')"`,
        ],
      });

      const worktreeBootstrap = await createBootstrapWorktreeForTest({
        cwd: repoDir,
        branchName: "feature-carriage-return",
        baseBranch: "main",
        worktreeSlug: "feature-carriage-return",
        paseoHome,
      });

      const persisted: AgentTimelineItem[] = [];
      await runAsyncWorktreeBootstrap({
        repoRoot: repoDir,
        paseoHome,
        agentId: "agent-carriage-return",
        workspaceId: "ws-carriage-return",
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
      expect(persistedSetupItem?.detail.type).toBe("worktree_setup");
      if (!persistedSetupItem || persistedSetupItem.detail.type !== "worktree_setup") {
        throw new Error("Expected worktree_setup tool detail");
      }

      expect(persistedSetupItem.detail.log).toContain("\nfetch 3/3\nready\n");
      expect(persistedSetupItem.detail.log).not.toContain("\nfetch 1/3\n");
      expect(persistedSetupItem.detail.log).not.toContain("\nfetch 2/3\n");
      expect(persistedSetupItem.detail.commands[0]?.log).toBe("fetch 3/3\nready\n");
    });

    it("shares the same worktree runtime port across setup and bootstrap terminals", async () => {
      await ProjectSettingsStore.forHome(paseoHome).update(repoDir, {
        setupCommands: ['echo "$INTERLOCK_WORKTREE_PORT" > setup-port.txt'],
      });
      writeFileSync(
        join(repoDir, "paseo.json"),
        JSON.stringify({ worktree: { terminals: [{ name: "Port Terminal", command: "true" }] } }),
      );
      execFileSync("git", ["add", "paseo.json"], { cwd: repoDir, stdio: "pipe" });
      execFileSync("git", ["-c", "commit.gpgsign=false", "commit", "-m", "add terminals"], {
        cwd: repoDir,
        stdio: "pipe",
      });

      const worktreeBootstrap = await createBootstrapWorktreeForTest({
        cwd: repoDir,
        branchName: "feature-shared-runtime-port",
        baseBranch: "main",
        worktreeSlug: "feature-shared-runtime-port",
        paseoHome,
      });

      const registeredEnvs: Array<{ cwd: string; env: Record<string, string> }> = [];
      const createTerminalEnvs: Record<string, string>[] = [];
      const createTerminalWorkspaceIds: Array<string | undefined> = [];
      const persisted: AgentTimelineItem[] = [];
      await runAsyncWorktreeBootstrap({
        repoRoot: repoDir,
        paseoHome,
        agentId: "agent-shared-runtime-port",
        workspaceId: "ws-shared-runtime-port",
        worktree: worktreeBootstrap.worktree,
        shouldBootstrap: worktreeBootstrap.shouldBootstrap,
        terminalManager: {
          async getTerminals() {
            return [];
          },
          async createTerminal(options) {
            createTerminalEnvs.push(options.env ?? {});
            createTerminalWorkspaceIds.push(options.workspaceId);
            return {
              id: "term-1",
              name: options.name ?? "Terminal",
              cwd: options.cwd,
              send: () => {},
              subscribe: () => () => {},
              onExit: () => () => {},
              onCommandFinished: () => () => {},
              onTitleChange: () => () => {},
              getSize: () => ({ rows: 1, cols: 1 }),
              getTitle: () => undefined,
              getExitInfo: () => null,
              getState: () => ({
                rows: 1,
                cols: 1,
                grid: [[{ char: "$" }]],
                scrollback: [],
                cursor: { row: 0, col: 0 },
              }),
              kill: () => {},
              killAndWait: async () => {},
            };
          },
          registerCwdEnv(options) {
            registeredEnvs.push({ cwd: options.cwd, env: options.env });
          },
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
        appendTimelineItem: async (item) => {
          persisted.push(item);
          return true;
        },
        emitLiveTimelineItem: async () => true,
      });

      const setupPortPath = join(worktreeBootstrap.worktree.worktreePath, "setup-port.txt");
      await waitForPathExists(setupPortPath);

      const setupPort = readFileSync(setupPortPath, "utf8").trim();
      expect(setupPort.length).toBeGreaterThan(0);
      expect(registeredEnvs).toHaveLength(1);
      expect(registeredEnvs[0]?.cwd).toBe(worktreeBootstrap.worktree.worktreePath);
      expect(registeredEnvs[0]?.env.INTERLOCK_WORKTREE_PORT).toBe(setupPort);
      expect(createTerminalEnvs.length).toBeGreaterThan(0);
      expect(createTerminalEnvs[0]?.INTERLOCK_WORKTREE_PORT).toBe(setupPort);
      expect(createTerminalWorkspaceIds).toEqual(["ws-shared-runtime-port"]);

      const terminalToolCall = persisted.find(
        (item): item is Extract<AgentTimelineItem, { type: "tool_call" }> =>
          item.type === "tool_call" &&
          item.name === "paseo_worktree_terminals" &&
          item.status === "completed",
      );
      expect(terminalToolCall?.status).toBe("completed");
    });
  });
});
