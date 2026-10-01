import { expect, test, vi } from "vitest";

import type { AgentManagerEvent, AgentSubscriber } from "./agent-manager.js";
import {
  CreateAgentLifecycleDispatch,
  registerAgentAutoArchive,
} from "./create-agent-lifecycle-dispatch.js";

class AgentLifecycleEvents {
  private readonly listeners = new Set<AgentSubscriber>();

  subscribe(listener: AgentSubscriber): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  completeTurn(agentId: string): void {
    const event: AgentManagerEvent = {
      type: "agent_stream",
      agentId,
      event: { type: "turn_completed", provider: "codex" },
    };
    for (const listener of this.listeners) listener(event);
  }

  listenerCount(): number {
    return this.listeners.size;
  }
}

test("auto-archive self-releases once and later cancellation waits harmlessly", async () => {
  const agentId = "4a7e2521-286d-4ad5-af35-e091c55302e3";
  const agents = new AgentLifecycleEvents();
  let archiveCount = 0;
  const registration = registerAgentAutoArchive({
    agentManager: agents,
    agentId,
    archive: async () => {
      archiveCount += 1;
    },
  });

  agents.completeTurn(agentId);
  await registration.cancel();
  await registration.cancel();
  agents.completeTurn(agentId);

  expect(archiveCount).toBe(1);
  expect(agents.listenerCount()).toBe(0);
});

function createDispatch() {
  const createPaseoWorktreeWorkflow = vi.fn(async () => ({}) as never);
  const dispatch = new CreateAgentLifecycleDispatch({
    paseoHome: "/home",
    createPaseoWorktreeWorkflow,
  } as unknown as ConstructorParameters<typeof CreateAgentLifecycleDispatch>[0]);
  return { dispatch, createPaseoWorktreeWorkflow };
}

test("a branch-off task without a branch name starts on agent/<id>-<prompt slug>", async () => {
  const { dispatch, createPaseoWorktreeWorkflow } = createDispatch();

  await dispatch.createWorktreeForRequest({
    cwd: "/repo",
    target: { mode: "branch-off" },
    firstAgentContext: { prompt: "Fix the login redirect" },
    hasLegacyGitOptions: false,
    agentId: "4f9c2a1e-7b6d-4c3a-9e1f-0a2b3c4d5e6f",
  });

  expect(createPaseoWorktreeWorkflow).toHaveBeenCalledWith(
    expect.objectContaining({
      action: "branch-off",
      worktreeSlug: "4f9c2a-fix-the-login-redirect",
      branchName: "agent/4f9c2a-fix-the-login-redirect",
    }),
    undefined,
  );
});

test("an explicit branch name from the client is kept", async () => {
  const { dispatch, createPaseoWorktreeWorkflow } = createDispatch();

  await dispatch.createWorktreeForRequest({
    cwd: "/repo",
    target: { mode: "branch-off", newBranch: "my-branch" },
    firstAgentContext: { prompt: "Fix the login redirect" },
    hasLegacyGitOptions: false,
    agentId: "4f9c2a1e-7b6d-4c3a-9e1f-0a2b3c4d5e6f",
  });

  expect(createPaseoWorktreeWorkflow).toHaveBeenCalledWith(
    expect.objectContaining({ worktreeSlug: "my-branch" }),
    undefined,
  );
});
