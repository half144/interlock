import { describe, expect, it } from "vitest";
import type { Agent, Message, Thread } from "@/types";
import { mergeAgent } from "./threads";

const agent = (patch: Partial<Agent>): Agent =>
  ({
    id: "a",
    projectId: "p",
    title: "Fix the race",
    aspect: "running",
    step: "Working",
    updatedAt: 5,
    unseen: 0,
    ...patch,
  }) as Agent;

const thread = (messages: Message[]): Thread => ({
  id: "a",
  projectId: "p",
  title: "t",
  updatedAt: 1,
  agentIds: ["a"],
  messages,
});

describe("mergeAgent", () => {
  it("keeps the unseen count the reader already has", () => {
    const { agent: merged } = mergeAgent(agent({ unseen: 3 }), agent({}), undefined);
    expect(merged.unseen).toBe(3);
  });

  it("takes the step line from the live plan while running", () => {
    const messages: Message[] = [
      {
        id: "a-1",
        role: "agent",
        at: 1,
        blocks: [
          {
            type: "step",
            text: "Add table",
            status: "in_progress",
            activeForm: "Adding the table",
          },
        ],
      },
    ];
    const { agent: merged } = mergeAgent(undefined, agent({}), thread(messages));
    expect(merged.step).toBe("Adding the table");
    expect(
      mergeAgent(undefined, agent({ aspect: "review", step: "Ready" }), thread(messages)).agent
        .step,
    ).toBe("Ready");
  });

  it("keeps a hold card at the end of the thread and drops it once answered", () => {
    const held = agent({
      aspect: "held",
      hold: { requestId: "r", kind: "approval", title: "Run", detail: "" },
    });
    const withHold = mergeAgent(undefined, held, thread([])).thread;
    expect(withHold.messages.at(-1)).toMatchObject({ role: "agent", blocks: [{ type: "hold" }] });
    const answered = mergeAgent(held, agent({}), withHold).thread;
    expect(JSON.stringify(answered.messages)).not.toContain("hold");
  });

  it("names the thread after the agent", () => {
    const { thread: merged } = mergeAgent(undefined, agent({}), undefined);
    expect(merged).toMatchObject({ id: "a", title: "Fix the race", updatedAt: 5, agentIds: ["a"] });
  });
});
