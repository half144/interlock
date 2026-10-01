import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Agent, Workspace } from "@/types";

const discard = vi.hoisted(() => vi.fn());
const deleteTask = vi.hoisted(() => vi.fn());
vi.mock("@/daemon/commands", () => ({ discard, deleteTask }));

const { useStore } = await import("./app-store");

const agent = (id: string, workspaceId: string) => ({ id, cwd: `/wt/${id}`, workspaceId }) as Agent;
const workspace = (id: string, isWorktree: boolean) => ({ id, isWorktree }) as Workspace;

describe("deleteTask", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useStore.setState({
      agents: { a1: agent("a1", "w1"), a2: agent("a2", "w2") },
      workspaces: { w1: workspace("w1", true), w2: workspace("w2", false) },
      view: { kind: "thread", threadId: "a1" },
    });
  });

  it("removes the worktree first, then the agent, for a worktree task", async () => {
    await useStore.getState().deleteTask("a1");
    expect(discard).toHaveBeenCalledWith("/wt/a1");
    expect(deleteTask).toHaveBeenCalledWith("a1");
    expect(discard.mock.invocationCallOrder[0]).toBeLessThan(
      deleteTask.mock.invocationCallOrder[0] ?? 0,
    );
  });

  it("only deletes the agent for a local task", async () => {
    await useStore.getState().deleteTask("a2");
    expect(discard).not.toHaveBeenCalled();
    expect(deleteTask).toHaveBeenCalledWith("a2");
  });

  it("goes to the yard only when the open thread is the one deleted", async () => {
    await useStore.getState().deleteTask("a2");
    expect(useStore.getState().view).toEqual({ kind: "thread", threadId: "a1" });
    await useStore.getState().deleteTask("a1");
    expect(useStore.getState().view).toEqual({ kind: "yard" });
  });
});
