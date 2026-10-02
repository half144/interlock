import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Agent } from "@/types";

const { useStore } = await import("../app-store");
const { turnEnded } = await import("./queue");

const agentIn = (aspect: Agent["aspect"]) => ({ id: "a1", aspect }) as Agent;

describe("message queue", () => {
  const sendMessage = vi.fn(() => Promise.resolve());

  beforeEach(() => {
    sendMessage.mockClear();
    useStore.setState({ queues: {}, paused: {}, sendMessage });
  });

  it("holds messages in order and sends one per finished turn", async () => {
    const { enqueue, flushQueue } = useStore.getState();
    enqueue("a1", "first", []);
    enqueue("a1", "second", []);
    await flushQueue("a1");
    expect(sendMessage).toHaveBeenCalledOnce();
    expect(sendMessage).toHaveBeenCalledWith("a1", "first", []);
    expect(useStore.getState().queues["a1"]?.map((m) => m.text)).toEqual(["second"]);
  });

  it("drops a message from the queue without sending it", () => {
    useStore.getState().enqueue("a1", "oops", []);
    const id = useStore.getState().queues["a1"]?.[0]?.id ?? "";
    useStore.getState().unqueue("a1", id);
    expect(useStore.getState().queues).toEqual({});
    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("waits for the user after a stop, and sending one resumes the queue", async () => {
    const { enqueue, flushQueue, sendQueued } = useStore.getState();
    enqueue("a1", "later", []);
    useStore.setState({ paused: { a1: true } });
    await flushQueue("a1");
    expect(sendMessage).not.toHaveBeenCalled();
    expect(useStore.getState().queues["a1"]).toHaveLength(1);

    useStore.setState({ paused: { a1: true } });
    await sendQueued("a1", useStore.getState().queues["a1"]?.[0]?.id ?? "");
    expect(sendMessage).toHaveBeenCalledWith("a1", "later", []);
    expect(useStore.getState().paused).toEqual({});
  });

  it("only a turn that ended on its own releases the queue", () => {
    expect(turnEnded(agentIn("running"), agentIn("review"))).toBe(true);
    expect(turnEnded(agentIn("running"), agentIn("idle"))).toBe(true);
    expect(turnEnded(agentIn("running"), agentIn("held"))).toBe(false);
    expect(turnEnded(agentIn("running"), agentIn("failed"))).toBe(false);
    expect(turnEnded(agentIn("review"), agentIn("idle"))).toBe(false);
    expect(turnEnded(undefined, agentIn("idle"))).toBe(false);
  });
});
