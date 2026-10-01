import { describe, expect, it } from "vitest";
import type { Agent, Block, Message } from "@/types";
import { thinkingLine, withPendingReply } from "./thinking";

const agent = (aspect: Agent["aspect"]): Agent =>
  ({ id: "a1", kind: "claude", aspect, step: "Working", turnStartedAt: 5, updatedAt: 9 }) as Agent;

const asked: Message = { id: "u1", role: "user", text: "rename it", at: 1 };
const replied: Message = {
  id: "a-1",
  role: "agent",
  blocks: [{ type: "text", text: "On it" }],
  at: 2,
};

const step = (status: "pending" | "in_progress" | "completed"): Block => ({
  type: "step",
  text: "Rename",
  status,
});

describe("withPendingReply", () => {
  it("opens an empty reply under the prompt while the turn has nothing to show yet", () => {
    expect(withPendingReply([asked], agent("running")).at(-1)).toEqual({
      id: "a-1",
      role: "agent",
      agentId: "a1",
      blocks: [],
      at: 5,
    });
    expect(withPendingReply([asked], agent("queued"))).toHaveLength(2);
  });

  it("leaves the conversation alone once the reply exists or the agent stops", () => {
    const both = [asked, replied];
    expect(withPendingReply(both, agent("running"))).toBe(both);
    expect(withPendingReply([asked], agent("review"))).toEqual([asked]);
    expect(withPendingReply([asked], agent("held"))).toEqual([asked]);
  });
});

describe("thinkingLine", () => {
  it("names the agent before anything comes back, then stays short under the reply", () => {
    expect(thinkingLine(agent("running"), [])).toBe("Claude Code is thinking");
    expect(thinkingLine(agent("running"), [{ type: "text", text: "On it" }])).toBe("Thinking");
  });

  it("gives way to a plan step that is already in progress", () => {
    expect(thinkingLine(agent("running"), [step("completed"), step("in_progress")])).toBeNull();
    expect(thinkingLine(agent("running"), [step("completed"), step("pending")])).toBe("Thinking");
  });

  it("says the agent is starting while it is queued and nothing once the turn ends", () => {
    expect(thinkingLine(agent("queued"), [])).toBe("Claude Code will start soon");
    expect(thinkingLine(agent("review"), [])).toBeNull();
    expect(thinkingLine(agent("held"), [])).toBeNull();
  });
});
