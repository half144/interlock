import type { DaemonClient } from "@interlock/client/internal/daemon-client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useStore } from "@/stores/app-store";
import type { Agent, Message } from "@/types";
import { watchTimeline } from "./timeline";

type Handler = (message: unknown) => void;

const entry = (text: string, seq: number) => ({
  item: { type: "assistant_message", text },
  timestamp: "2026-10-01T10:00:00.000Z",
  seqStart: seq,
  seqEnd: seq,
});

const page = (entries: unknown[], maxSeq: number, epoch = "e1") => ({
  epoch,
  entries,
  window: { minSeq: 1, maxSeq, nextSeq: maxSeq + 1 },
});

const stream = (text: string, seq: number, epoch = "e1") => ({
  type: "agent_stream",
  payload: {
    agentId: "a",
    timestamp: "2026-10-01T10:00:01.000Z",
    seq,
    epoch,
    event: { type: "timeline", provider: "mock", item: { type: "assistant_message", text } },
  },
});

function fakeClient(pages: unknown[]) {
  let handler: Handler = () => undefined;
  const fetchAgentTimeline = vi.fn(() => Promise.resolve(pages.shift()));
  const client = {
    fetchAgentTimeline,
    subscribeAgentTimeline: (_id: string, h: Handler) => {
      handler = h;
      return () => undefined;
    },
  } as unknown as DaemonClient;
  return { client, fetchAgentTimeline, push: (m: unknown) => handler(m) };
}

const textOf = () =>
  (useStore.getState().threads["a"]?.messages ?? []).flatMap((m: Message) =>
    m.role === "agent" ? m.blocks.flatMap((b) => (b.type === "text" ? [b.text] : [])) : [],
  );

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
  vi.runAllTimers();
};

describe("watchTimeline", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("requestAnimationFrame", (cb: () => void) => setTimeout(cb, 0));
    vi.stubGlobal("cancelAnimationFrame", (id: number) => clearTimeout(id));
    useStore.setState({
      agents: { a: { id: "a", aspect: "running" } as Agent },
      threads: {
        a: { id: "a", projectId: "p", title: "t", updatedAt: 0, agentIds: ["a"], messages: [] },
      },
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("loads the tail, then applies live rows in order and ignores rows the tail covers", async () => {
    const { client, push } = fakeClient([page([entry("Hello", 2)], 2)]);
    watchTimeline(client, "a");
    await flush();
    expect(textOf()).toEqual(["Hello"]);
    push(stream("stale", 2));
    push(stream(", world", 3));
    await flush();
    expect(textOf()).toEqual(["Hello, world"]);
  });

  it("buffers rows that arrive before the tail and applies the newer ones", async () => {
    const { client, push } = fakeClient([page([entry("One", 1)], 1)]);
    watchTimeline(client, "a");
    push(stream("old", 1));
    push(stream(" two", 2));
    await flush();
    await flush();
    expect(textOf()).toEqual(["One two"]);
  });

  it("fetches the tail again on a sequence gap", async () => {
    const { client, push, fetchAgentTimeline } = fakeClient([
      page([entry("A", 1)], 1),
      page([entry("AB", 1), entry("C", 5)], 5),
    ]);
    watchTimeline(client, "a");
    await flush();
    push(stream("x", 4));
    await flush();
    await flush();
    expect(fetchAgentTimeline).toHaveBeenCalledTimes(2);
    expect(textOf().join("")).toContain("C");
  });
});
