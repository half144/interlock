import { describe, expect, it } from "vitest";
import type { ToolCallTimelineItem } from "@interlock/protocol/agent-types";
import { toolChip, toolNameOf } from "./tools";

const call = (name: string, detail: ToolCallTimelineItem["detail"]): ToolCallTimelineItem => ({
  type: "tool_call",
  callId: "c1",
  name,
  status: "completed",
  error: null,
  detail,
});

describe("toolNameOf", () => {
  it("maps detail kinds and falls back on the tool name", () => {
    expect(toolNameOf(call("bash", { type: "shell", command: "ls" }))).toBe("shell");
    expect(toolNameOf(call("x", { type: "unknown", input: 1, output: 2 }))).toBe("other");
    expect(toolNameOf(call("mcp__gh__issue", { type: "unknown", input: 1, output: 2 }))).toBe(
      "mcp",
    );
  });
});

describe("toolChip", () => {
  it("labels a shell call with its exit code", () => {
    const chip = toolChip(call("bash", { type: "shell", command: "npm test", exitCode: 0 }));
    expect(chip).toEqual({ callId: "c1", tool: "shell", label: "Ran `npm test` · exit 0" });
  });

  it("labels reads, edits and searches", () => {
    expect(toolChip(call("r", { type: "read", filePath: "src/a.ts" })).label).toBe("Read a.ts");
    expect(toolChip(call("e", { type: "edit", filePath: "src/a.ts" })).label).toBe(
      "Edited src/a.ts",
    );
    expect(toolChip(call("s", { type: "search", query: "x", numMatches: 5 })).label).toBe(
      "Searched “x” · 5 results",
    );
  });

  it("flags failures", () => {
    const failed: ToolCallTimelineItem = {
      type: "tool_call",
      callId: "c2",
      name: "bash",
      status: "failed",
      error: "boom",
      detail: { type: "shell", command: "x" },
    };
    expect(toolChip(failed).failed).toBe(true);
  });
});
