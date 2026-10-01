import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type pino from "pino";
import type { SessionOutboundMessage } from "../../messages.js";
import { ProjectSettingsStore } from "../../project-settings/project-settings-store.js";
import { ProjectSettingsSession } from "./project-settings-session.js";

const logger = { warn: vi.fn() } as unknown as pino.Logger;

describe("ProjectSettingsSession", () => {
  let home: string;
  let repoRoot: string;
  let emitted: SessionOutboundMessage[];
  let session: ProjectSettingsSession;
  const projects: Record<
    string,
    { rootPath: string; kind: "git" | "non_git"; archivedAt: string | null }
  > = {};

  beforeEach(() => {
    home = mkdtempSync(path.join(tmpdir(), "settings-session-home-"));
    repoRoot = mkdtempSync(path.join(tmpdir(), "settings-session-repo-"));
    emitted = [];
    projects["p1"] = { rootPath: repoRoot, kind: "git", archivedAt: null };
    projects["plain"] = { rootPath: "/plain", kind: "non_git", archivedAt: null };
    projects["gone"] = { rootPath: repoRoot, kind: "git", archivedAt: "2026-01-01" };
    session = new ProjectSettingsSession({
      host: { emit: (msg) => emitted.push(msg) },
      projectRegistry: { get: async (id) => (projects[id] ?? null) as never },
      workspaceGitService: { resolveRepoRoot: async (cwd) => cwd },
      store: ProjectSettingsStore.forHome(home),
      logger,
    });
  });

  afterEach(() => {
    rmSync(home, { recursive: true, force: true });
    rmSync(repoRoot, { recursive: true, force: true });
  });

  it("returns defaults and the .worktreeinclude patterns", async () => {
    writeFileSync(path.join(repoRoot, ".worktreeinclude"), ".env*\n");

    await session.handleGetRequest({
      type: "project.settings.get.request",
      requestId: "r1",
      projectId: "p1",
    });

    expect(emitted[0]).toMatchObject({
      type: "project.settings.get.response",
      payload: {
        requestId: "r1",
        settings: { archiveAfterMerge: true, autonomy: "auto", setupCommands: [] },
        worktreeInclude: [".env*"],
        error: null,
      },
    });
  });

  it("updates settings and returns the merged result", async () => {
    await session.handleUpdateRequest({
      type: "project.settings.update.request",
      requestId: "r2",
      projectId: "p1",
      patch: { autonomy: "full-auto", archiveAfterMerge: false },
    });

    expect(emitted[0]).toMatchObject({
      type: "project.settings.update.response",
      payload: { settings: { autonomy: "full-auto", archiveAfterMerge: false }, error: null },
    });
  });

  it("rejects an invalid patch without writing", async () => {
    await session.handleUpdateRequest({
      type: "project.settings.update.request",
      requestId: "r3",
      projectId: "p1",
      patch: { copyFiles: ["/etc/passwd"] },
    });

    expect(emitted[0]).toMatchObject({
      payload: { settings: null, errorCode: "invalid_settings" },
    });
  });

  it.each([
    ["missing", "nope", "project_not_found"],
    ["archived", "gone", "project_not_found"],
    ["non-git", "plain", "not_a_git_repo"],
  ])("answers a %s project with a typed error", async (_label, projectId, errorCode) => {
    await session.handleGetRequest({
      type: "project.settings.get.request",
      requestId: "r4",
      projectId,
    });

    expect(emitted[0]).toMatchObject({ payload: { settings: null, errorCode } });
  });

  it("suggests the install command from the lockfile", async () => {
    writeFileSync(path.join(repoRoot, "pnpm-lock.yaml"), "");

    await session.handleSuggestSetupRequest({
      type: "project.setup.suggest.request",
      requestId: "r5",
      projectId: "p1",
    });

    expect(emitted[0]).toMatchObject({
      type: "project.setup.suggest.response",
      payload: {
        suggestion: { packageManager: "pnpm", lockfile: "pnpm-lock.yaml", command: "pnpm install" },
        error: null,
      },
    });
  });
});
