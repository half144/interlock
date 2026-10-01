import { describe, expect, it } from "vitest";
import {
  appendSubagentEvent,
  finishSubagent,
  toSubagent,
  toSubagentEvent,
  type ProviderSubagentDescriptorPayload,
} from "./subagents";

const origin = Date.parse("2026-10-01T10:00:00.000Z");

const descriptor = (
  status: ProviderSubagentDescriptorPayload["status"],
): ProviderSubagentDescriptorPayload => ({
  id: "s1",
  parentAgentId: "p1",
  provider: "claude",
  title: null,
  description: "Explore the repo",
  status,
  createdAt: "2026-10-01T10:00:10.000Z",
  updatedAt: "2026-10-01T10:01:00.000Z",
  toolCallId: "tc1",
});

describe("toSubagent", () => {
  it("measures time from the parent and only ends finished runs", () => {
    expect(toSubagent(descriptor("running"), origin)).toEqual({
      id: "s1",
      parentId: "p1",
      toolCallId: "tc1",
      name: "Explore the repo",
      brief: "Explore the repo",
      subtitle: null,
      status: "running",
      startSec: 10,
      events: [],
    });
    expect(toSubagent(descriptor("canceled"), origin)).toMatchObject({
      status: "stopped",
      endSec: 60,
    });
  });
});

describe("toSubagent subtitle", () => {
  it("carries the provider's compact line as it is", () => {
    const sub = toSubagent(
      { ...descriptor("running"), subtitle: "Sonnet 4.5 · High · 12.3k tokens" },
      origin,
    );
    expect(sub.subtitle).toBe("Sonnet 4.5 · High · 12.3k tokens");
  });
});

describe("subagent events", () => {
  it("maps tool calls with facts and excerpts", () => {
    const event = toSubagentEvent(
      {
        type: "tool_call",
        callId: "c",
        name: "bash",
        status: "completed",
        error: null,
        detail: { type: "shell", command: "ls", output: "a\nb", exitCode: 0 },
      },
      "2026-10-01T10:00:05.000Z",
      origin,
    );
    expect(event).toEqual({ kind: "shell", text: "ls", sec: 5, meta: "exit 0", body: ["a", "b"] });
  });

  it("skips reasoning and merges consecutive notes into the result", () => {
    expect(
      toSubagentEvent({ type: "reasoning", text: "x" }, "2026-10-01T10:00:00Z", origin),
    ).toBeNull();
    let sub = toSubagent(descriptor("completed"), origin);
    sub = appendSubagentEvent(sub, { kind: "note", text: "All ", sec: 1 });
    sub = appendSubagentEvent(sub, { kind: "note", text: "done", sec: 2 });
    expect(sub.events).toHaveLength(1);
    expect(finishSubagent(sub).result).toBe("All done");
  });
});
