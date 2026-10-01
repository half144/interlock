import { writeFileSync } from "node:fs";
import path from "node:path";
import type { Logger } from "pino";
import { expect, test, vi } from "vitest";
import type { SessionOutboundMessage } from "../../messages.js";
import type { ArchiveDependencies } from "../../workspace-archive-service.js";
import { git, makeTempDir } from "./git-fixture.js";
import { ShipSession } from "./ship-session.js";

function createSession(
  archiveDependencies: () => ArchiveDependencies = () => {
    throw new Error("not used");
  },
) {
  const emitted: SessionOutboundMessage[] = [];
  const notifyGitMutation = vi.fn(async () => undefined);
  const session = new ShipSession({
    emit: (message) => emitted.push(message),
    workspaceGitService: { resolveForge: vi.fn(async () => null) },
    gitMutation: { notifyGitMutation },
    archiveDependencies,
    logger: { warn: vi.fn() } as unknown as Logger,
  });
  return { session, emitted, notifyGitMutation };
}

test("answers a create-PR request for a repo without a remote with an actionable error", async () => {
  const repo = makeTempDir("ship-session");
  git(repo, "init", "--initial-branch=main");
  writeFileSync(path.join(repo, "a.txt"), "a\n");
  const { session, emitted } = createSession();

  await session.handleCreatePrRequest({
    type: "task_create_pr_request",
    cwd: repo,
    title: "Task",
    requestId: "r1",
  });

  expect(emitted).toEqual([
    {
      type: "task_create_pr_response",
      payload: {
        cwd: repo,
        number: null,
        url: null,
        committed: false,
        error: { code: "no_remote", message: expect.stringContaining("git remote add origin") },
        requestId: "r1",
      },
    },
  ]);
});

test("answers a discard request for a directory Interlock does not own with an error", async () => {
  const { session, emitted } = createSession(
    () => ({ paseoHome: makeTempDir("home") }) as ArchiveDependencies,
  );
  const dir = makeTempDir("not-owned");

  await session.handleDiscardRequest({ type: "task_discard_request", cwd: dir, requestId: "r2" });

  expect(emitted[0]).toMatchObject({
    type: "task_discard_response",
    payload: { success: false, error: { code: "unknown" } },
  });
});
