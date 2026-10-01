import { describe, expect, it } from "vitest";
import type { AgentTimelineItem, ToolCallTimelineItem } from "@interlock/protocol/agent-types";
import {
  applyTimelineItem,
  buildMessages,
  currentStep,
  withTrailingBlocks,
  type TimelineInput,
} from "./timeline";

const at = (item: AgentTimelineItem, timestamp = "2026-10-01T10:00:00.000Z"): TimelineInput => ({
  item,
  timestamp,
});

const bash = (callId: string, status: "running" | "completed" = "running"): AgentTimelineItem => ({
  type: "tool_call",
  callId,
  name: "bash",
  status,
  error: null,
  detail: { type: "shell", command: "ls" },
});

const subAgent = (callId: string): ToolCallTimelineItem => ({
  type: "tool_call",
  callId,
  name: "Task",
  status: "running",
  error: null,
  detail: { type: "sub_agent", log: "" },
});

describe("applyTimelineItem", () => {
  it("appends live assistant deltas to the same text block", () => {
    const messages = buildMessages(
      [
        at({ type: "user_message", text: "hi", messageId: "u1" }),
        at({ type: "assistant_message", text: "Hel" }),
        at({ type: "assistant_message", text: "lo" }),
      ],
      "a1",
    );
    expect(messages).toHaveLength(2);
    expect(messages[1]).toMatchObject({ role: "agent", blocks: [{ type: "text", text: "Hello" }] });
  });

  it("starts a new text block after a tool call", () => {
    const messages = buildMessages(
      [
        at({ type: "assistant_message", text: "a" }),
        at(bash("c1")),
        at({ type: "assistant_message", text: "b" }),
      ],
      "a1",
    );
    const blocks = messages[0]?.role === "agent" ? messages[0].blocks : [];
    expect(blocks.map((b) => b.type)).toEqual(["text", "tools", "text"]);
  });

  it("upserts a tool call by id", () => {
    const messages = buildMessages([at(bash("c1")), at(bash("c1", "completed"))], "a1");
    const block = messages[0]?.role === "agent" ? messages[0].blocks[0] : undefined;
    expect(block).toMatchObject({ type: "tools", tools: [{ callId: "c1" }] });
    expect(block?.type === "tools" && block.tools).toHaveLength(1);
  });

  it("groups tool calls under the in-progress step", () => {
    const messages = buildMessages(
      [
        at({
          type: "todo",
          items: [
            { text: "A", completed: false, status: "in_progress", activeForm: "Doing A" },
            { text: "B", completed: false, status: "pending" },
          ],
        }),
        at(bash("c1")),
      ],
      "a1",
    );
    const blocks = messages[0]?.role === "agent" ? messages[0].blocks : [];
    expect(blocks).toHaveLength(2);
    expect(blocks[0]).toMatchObject({ type: "step", tools: [{ callId: "c1" }] });
    expect(currentStep(messages)).toBe("Doing A");
  });

  it("replaces the plan in place and keeps tools of equal steps", () => {
    const first = at({
      type: "todo",
      items: [{ text: "A", completed: false, status: "in_progress" }],
    });
    const messages = buildMessages(
      [
        first,
        at(bash("c1")),
        at({ type: "assistant_message", text: "mid" }),
        at({
          type: "todo",
          items: [
            { text: "A", completed: true, status: "completed" },
            { text: "B", completed: false, status: "in_progress" },
          ],
        }),
      ],
      "a1",
    );
    const blocks = messages[0]?.role === "agent" ? messages[0].blocks : [];
    expect(blocks.map((b) => b.type)).toEqual(["step", "step", "text"]);
    expect(blocks[0]).toMatchObject({ status: "completed", tools: [{ callId: "c1" }] });
  });

  it("groups consecutive sub agent calls into one delegate", () => {
    const messages = buildMessages(
      [at(subAgent("s1")), at(subAgent("s2")), at(subAgent("s1"))],
      "a1",
    );
    const blocks = messages[0]?.role === "agent" ? messages[0].blocks : [];
    expect(blocks).toEqual([{ type: "delegate", agentId: "a1", toolCallIds: ["s1", "s2"] }]);
  });

  it("replaces an optimistic user message with the canonical one", () => {
    const optimistic = [{ id: "client-1", role: "user" as const, text: "hi", at: 1 }];
    const next = applyTimelineItem(
      optimistic,
      at({ type: "user_message", text: "hi", messageId: "srv-1", clientMessageId: "client-1" }),
      "a1",
    );
    expect(next).toHaveLength(1);
    expect(next[0]?.id).toBe("client-1");
  });

  it("turns errors and completed compactions into notices", () => {
    const messages = buildMessages(
      [
        at({ type: "error", message: "boom" }),
        at({ type: "compaction", status: "loading" }),
        at({ type: "compaction", status: "completed" }),
      ],
      "a1",
    );
    const blocks = messages[0]?.role === "agent" ? messages[0].blocks : [];
    expect(blocks).toEqual([
      { type: "notice", level: "error", text: "boom" },
      { type: "notice", level: "info", text: "Compacted the conversation" },
    ]);
  });
});

describe("withTrailingBlocks", () => {
  it("adds and removes hold and changes blocks at the end", () => {
    const base = buildMessages([at({ type: "assistant_message", text: "x" })], "a1");
    const held = withTrailingBlocks(base, "a1", { hold: true, changes: true });
    const blocks = held[0]?.role === "agent" ? held[0].blocks.map((b) => b.type) : [];
    expect(blocks).toEqual(["text", "changes", "hold"]);
    expect(withTrailingBlocks(held, "a1", { hold: true, changes: true })).toBe(held);
    const cleared = withTrailingBlocks(held, "a1", { hold: false, changes: false });
    expect(cleared[0]?.role === "agent" && cleared[0].blocks).toHaveLength(1);
  });

  it("creates an agent message after a user one and keeps new items before the hold", () => {
    const user = buildMessages([at({ type: "user_message", text: "go", messageId: "u" })], "a1");
    const held = withTrailingBlocks(user, "a1", { hold: true, changes: false });
    expect(held).toHaveLength(2);
    const grown = applyTimelineItem(held, at({ type: "assistant_message", text: "ok" }), "a1");
    const blocks = grown[1]?.role === "agent" ? grown[1].blocks.map((b) => b.type) : [];
    expect(blocks).toEqual(["text"]);
  });

  it("drops the agent message it created once the hold is answered", () => {
    const user = buildMessages([at({ type: "user_message", text: "go", messageId: "u" })], "a1");
    const held = withTrailingBlocks(user, "a1", { hold: true, changes: false });
    const answered = withTrailingBlocks(held, "a1", { hold: false, changes: false });
    expect(answered).toHaveLength(1);
    expect(answered[0]?.role).toBe("user");
  });
});

describe("currentStep", () => {
  it("falls back to the call that is running, in the present", () => {
    const messages = buildMessages([at(bash("c1"))], "a1");
    expect(currentStep(messages)).toBe("Listing files");
    expect(currentStep(buildMessages([at(bash("c1", "completed"))], "a1"))).toBeNull();
    expect(currentStep([])).toBeNull();
  });
});
