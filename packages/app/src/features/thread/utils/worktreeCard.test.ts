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
  it("counts plan steps while the agent runs and shimmers its status", () => {
    const line = worktreeCardLine(
      agent("running"),
      thread(["completed", "in_progress", "pending"]),
      false,
    );
    expect(line).toMatchObject({
      counter: "1 / 3",
      counterTone: "muted",
      statusTone: "shimmer",
      mark: "step",
      rowHeight: 56,
      headline: "step 1",
    });
  });

  it("settles into the outcome once the work is ready, until the card is expanded", () => {
    const done = thread(["completed"]);
    const collapsed = worktreeCardLine(agent("review"), done, false);
    expect(collapsed).toMatchObject({
      counter: "Ready for review",
      counterTone: "green",
      mark: "review",
      rowHeight: 40,
    });
    expect(worktreeCardLine(agent("review"), done, true)).toMatchObject({
      counter: "1 / 1",
      counterTone: "muted",
    });
  });

  it("marks a merged task with the merge tone and a held one as waiting", () => {
    expect(
      worktreeCardLine(agent("merged", { pr: 7 }), thread(["completed"]), false),
    ).toMatchObject({
      counter: "Merged as #7",
      counterTone: "merge",
      mark: "merged",
    });
    expect(worktreeCardLine(agent("held"), thread([]), false).statusTone).toBe("hold");
  });

  it("falls back to the status line without a plan", () => {
    const line = worktreeCardLine(agent("running"), thread([]), false);
    expect(line.headline).toBe("Claude Code is working");
    expect(line.rowHeight).toBe(40);
  });
});
