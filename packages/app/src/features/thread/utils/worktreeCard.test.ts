import { describe, expect, it } from "vitest";
import type { Agent, Thread } from "@/types";
import { worktreeCardLine } from "./worktreeCard";

const agent = (aspect: Agent["aspect"], extra: Partial<Agent> = {}): Agent =>
  ({ kind: "claude", aspect, step: "Working", ...extra }) as Agent;

const thread = (statuses: ("pending" | "in_progress" | "completed")[]): Thread => ({
  id: "a",
  projectId: "p",
  title: "t",
  updatedAt: 0,
  agentIds: ["a"],
  messages: [
    {
      id: "m",
      role: "agent",
      at: 0,
      blocks: statuses.map((status, i) => ({ type: "step" as const, text: `step ${i}`, status })),
    },
  ],
});

describe("worktreeCardLine", () => {
  it("counts plan steps and shimmers while the agent thinks inside the step it's on", () => {
    const line = worktreeCardLine(
      agent("running"),
      thread(["completed", "in_progress", "pending"]),
    );
    expect(line).toMatchObject({
      counter: "1 / 3",
      live: { text: "Thinking", tone: "shimmer" },
      mark: "step",
      rowHeight: 56,
      headline: "step 1",
    });
  });

  it("drops to one line between steps, when the conversation says the agent is thinking", () => {
    const line = worktreeCardLine(agent("running"), thread(["completed", "pending"]));
    expect(line).toMatchObject({ live: null, rowHeight: 40, headline: "step 1" });
  });

  it("keeps the finished plan's count and leaves the outcome to the conversation", () => {
    expect(worktreeCardLine(agent("review"), thread(["completed", "completed"]))).toMatchObject({
      counter: "2 / 2",
      mark: "review",
      live: null,
      rowHeight: 40,
    });
    expect(worktreeCardLine(agent("merged", { pr: 7 }), thread(["completed"])).mark).toBe("merged");
  });

  it("says when the agent is waiting on you", () => {
    expect(worktreeCardLine(agent("held"), thread(["in_progress"])).live).toEqual({
      text: "Claude Code is waiting for you",
      tone: "hold",
    });
  });

  it("only follows the plan of the turn on screen", () => {
    const earlier = thread(["completed", "completed"]);
    const asked = {
      ...earlier,
      messages: [...earlier.messages, { id: "u", role: "user" as const, text: "more", at: 1 }],
    };
    expect(worktreeCardLine(agent("running"), asked).steps).toEqual([]);
  });
});
