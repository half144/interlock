import { describe, expect, it } from "vitest";
import type { AgentSnapshotPayload } from "@interlock/protocol/messages";
import { toAgent, type AgentContext } from "./agents";

const snapshot = (patch: Partial<AgentSnapshotPayload> = {}): AgentSnapshotPayload => ({
  id: "614e2d0f-e024-4905-907c-5be07733dd48",
  provider: "mock",
  cwd: "/wt",
  workspaceId: "w1",
  model: "five-minute-stream",
  createdAt: "2026-10-01T14:19:49.577Z",
  updatedAt: "2026-10-01T14:19:49.614Z",
  lastUserMessageAt: null,
  status: "running",
  activeTurn: { turnId: "t", startedAt: "2026-10-01T14:19:49.614Z" },
  capabilities: {
    supportsStreaming: true,
    supportsSessionPersistence: true,
    supportsDynamicModes: false,
    supportsMcpServers: false,
    supportsReasoningStream: true,
    supportsToolInvocations: true,
  },
  currentModeId: "approval-test",
  availableModes: [],
  pendingPermissions: [],
  persistence: null,
  title: null,
  labels: {},
  ...patch,
});

const ctx: AgentContext = {
  workspace: {
    id: "w1",
    projectId: "p1",
    directory: "/wt",
    name: "n",
    branch: "amiable-spider",
    remoteUrl: null,
    isWorktree: true,
    additions: 3,
    deletions: 1,
  },
  projectId: "p1",
  baseBranch: "main",
  pr: null,
  modelLabel: (_kind, id) => `label:${id}`,
};

describe("toAgent", () => {
  it("maps the snapshot to the store shape", () => {
    expect(toAgent(snapshot(), ctx)).toMatchObject({
      id: "614e2d0f-e024-4905-907c-5be07733dd48",
      headcode: "614e2d0",
      threadId: "614e2d0f-e024-4905-907c-5be07733dd48",
      projectId: "p1",
      workspaceId: "w1",
      title: "Untitled task",
      branch: "amiable-spider",
      base: "main",
      kind: "mock",
      model: "label:five-minute-stream",
      aspect: "running",
      step: "Working",
      turnStartedAt: Date.parse("2026-10-01T14:19:49.614Z"),
      additions: 3,
      mode: "auto",
    });
  });

  it("is idle with changes for review and holds on pending permissions", () => {
    expect(toAgent(snapshot({ status: "idle", activeTurn: null }), ctx)).toMatchObject({
      aspect: "review",
      turnStartedAt: null,
    });
    const held = toAgent(
      snapshot({
        pendingPermissions: [
          {
            id: "r1",
            provider: "mock",
            name: "Bash",
            kind: "tool",
            detail: { type: "shell", command: "ls" },
          },
        ],
      }),
      ctx,
    );
    expect(held).toMatchObject({ aspect: "held", hold: { command: "ls" } });
  });

  it("reports failures, plan mode, effort and merged PR", () => {
    const failed = toAgent(
      snapshot({
        status: "error",
        lastError: "boom",
        currentModeId: "plan",
        thinkingOptionId: "high",
      }),
      {
        ...ctx,
        pr: { number: 9, merged: true },
      },
    );
    expect(failed).toMatchObject({
      aspect: "merged",
      mode: "plan",
      effort: "high",
      pr: 9,
      error: "boom",
    });
    expect(toAgent(snapshot({ status: "error", lastError: "boom" }), ctx)?.step).toBe("boom");
  });

  it("skips unknown providers and agents without a project", () => {
    expect(toAgent(snapshot({ provider: "gemini" }), ctx)).toBeNull();
    expect(toAgent(snapshot(), { ...ctx, projectId: null })).toBeNull();
  });
});
