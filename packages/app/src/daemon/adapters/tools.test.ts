import { describe, expect, it } from "vitest";
import type { ToolCallTimelineItem } from "@interlock/protocol/agent-types";
import { isBookkeeping, toolChip, toolNameOf } from "./tools";

const call = (name: string, detail: ToolCallTimelineItem["detail"]): ToolCallTimelineItem => ({
  type: "tool_call",
  callId: "c1",
  name,
  status: "completed",
  error: null,
  detail,
});

const failed = (name: string, detail: ToolCallTimelineItem["detail"], error: unknown) =>
  ({ ...call(name, detail), status: "failed", error }) as ToolCallTimelineItem;

describe("toolNameOf", () => {
  it("maps detail kinds and falls back on the tool name", () => {
    expect(toolNameOf(call("bash", { type: "shell", command: "ls" }))).toBe("shell");
    expect(toolNameOf(call("x", { type: "unknown", input: 1, output: 2 }))).toBe("other");
    expect(toolNameOf(call("mcp__gh__issue", { type: "unknown", input: 1, output: 2 }))).toBe(
      "mcp",
    );
  });
});

describe("isBookkeeping", () => {
  it("knows the calls that only feed the plan or load tools", () => {
    const quiet = { type: "unknown", input: {}, output: null } as const;
    expect(isBookkeeping(call("TaskCreate", quiet))).toBe(true);
    expect(isBookkeeping(call("ToolSearch", quiet))).toBe(true);
    expect(isBookkeeping(call("EnterPlanMode", quiet))).toBe(true);
    expect(isBookkeeping(call("AskUserQuestion", quiet))).toBe(false);
    expect(isBookkeeping(call("Bash", { type: "shell", command: "ls" }))).toBe(false);
  });
});

describe("toolChip", () => {
  it("says what a shell command did and keeps the command and output to open", () => {
    const chip = toolChip(
      call("Bash", { type: "shell", command: "cat package.json | head -20", output: "{}" }),
    );
    expect(chip).toMatchObject({
      callId: "c1",
      action: "read",
      verb: "Read",
      target: "package.json",
      label: "Read package.json",
      status: "done",
      explored: { files: ["package.json"], looks: [] },
      detail: { type: "command", command: "cat package.json | head -20", output: "{}" },
    });
  });

  it("names reads, searches and globs by what they touched", () => {
    expect(toolChip(call("Read", { type: "read", filePath: "/w/src/a.ts" })).label).toBe(
      "Read a.ts",
    );
    const grep = toolChip(call("Grep", { type: "search", query: "x", numMatches: 5 }));
    expect(grep).toMatchObject({ label: "Searched for “x”", meta: "5 matches" });
    const glob = toolChip(
      call("Glob", { type: "search", query: "**/*.md", toolName: "glob", numFiles: 1 }),
    );
    expect(grep.explored).toEqual({ files: [], looks: ["search"] });
    expect(glob).toMatchObject({ verb: "Found files matching", literal: true, meta: "1 file" });
  });

  it("counts an edit's lines and keeps its diff", () => {
    const chip = toolChip(
      call("Edit", {
        type: "edit",
        filePath: "/w/package.json",
        oldString: '{\n  "start": "node a"\n}',
        newString: '{\n  "start": "node a",\n  "test": "node --test"\n}',
      }),
    );
    expect(chip).toMatchObject({
      label: "Edited package.json",
      stat: { additions: 2, deletions: 1 },
    });
    expect(chip.detail).toEqual({
      type: "diff",
      lines: [
        { kind: "ctx", text: "{" },
        { kind: "del", text: '  "start": "node a"' },
        { kind: "add", text: '  "start": "node a",' },
        { kind: "add", text: '  "test": "node --test"' },
        { kind: "ctx", text: "}" },
      ],
    });
  });

  it("reads a unified diff and counts a written file as added lines", () => {
    const patch = "--- a/x\n+++ b/x\n@@ -1 +1 @@\n-old\n+new\n@@ -9 +9 @@\n same\n";
    const edited = toolChip(
      call("apply_patch", { type: "edit", filePath: "x", unifiedDiff: patch }),
    );
    expect(edited.stat).toEqual({ additions: 1, deletions: 1 });
    expect(edited.detail).toEqual({
      type: "diff",
      lines: [
        { kind: "del", text: "old" },
        { kind: "add", text: "new" },
        { kind: "ctx", text: "⋯" },
        { kind: "ctx", text: "same" },
      ],
    });
    const written = toolChip(
      call("Write", { type: "write", filePath: "/w/b.ts", content: "a\nb" }),
    );
    expect(written).toMatchObject({ label: "Wrote b.ts", stat: { additions: 2, deletions: 0 } });
  });

  it("reads Claude's exit code off a failed command and keeps what it printed", () => {
    const chip = toolChip(
      failed(
        "Bash",
        { type: "shell", command: "node x.js" },
        {
          type: "tool_result",
          content: "Exit code 1\nError: Cannot find module",
        },
      ),
    );
    expect(chip).toMatchObject({ status: "failed", failure: "exit 1" });
    expect(chip.detail).toEqual({
      type: "command",
      command: "node x.js",
      output: "Error: Cannot find module",
    });
  });

  it("shows no output for a command that printed nothing", () => {
    const quiet = call("Bash", {
      type: "shell",
      command: "echo red > a.txt",
      output: "(Bash completed with no output)",
    });
    expect(toolChip(quiet).detail).toEqual({ type: "command", command: "echo red > a.txt" });
  });

  it("treats a non-zero exit as a failure even when the call completed", () => {
    const chip = toolChip(call("shell", { type: "shell", command: "npm test", exitCode: 2 }));
    expect(chip).toMatchObject({ label: "Ran tests", status: "failed", failure: "exit 2" });
  });

  it("shows why any other call failed", () => {
    const chip = toolChip(
      failed("Edit", { type: "edit", filePath: "a.ts" }, "old_string not found"),
    );
    expect(chip).toMatchObject({
      status: "failed",
      failure: "failed",
      detail: { type: "text", text: "old_string not found" },
    });
  });

  it("says a background task ended without repeating its name as the reason", () => {
    const chip = toolChip(
      failed(
        "task_notification",
        { type: "plain_text", label: "Run tests after delay" },
        { message: "Run tests after delay" },
      ),
    );
    expect(chip).toMatchObject({ label: "Run tests after delay", meta: "background task" });
    expect(chip.detail).toBeUndefined();
  });

  it("speaks in the present while a call runs, even before its input arrives", () => {
    const running = (name: string, detail: ToolCallTimelineItem["detail"]) =>
      ({ ...call(name, detail), status: "running" }) as ToolCallTimelineItem;
    expect(toolChip(running("Bash", { type: "shell", command: "npm test" })).label).toBe(
      "Running tests",
    );
    expect(toolChip(running("Bash", { type: "unknown", input: {}, output: null }))).toMatchObject({
      action: "run",
      label: "Running a command",
      status: "running",
    });
    expect(
      toolChip(running("Read", { type: "unknown", input: {}, output: null })).explored,
    ).toEqual({ files: [], looks: [] });
  });

  it("names Claude's own tools in words", () => {
    const quiet = { type: "unknown", input: {}, output: null } as const;
    expect(toolChip(call("AskUserQuestion", quiet))).toMatchObject({
      action: "ask",
      label: "Asked you a question",
    });
    expect(toolChip(call("TaskOutput", quiet)).label).toBe("Checked a command");
    const skill = { type: "plain_text", label: "frontend-design", text: "…" } as const;
    expect(toolChip(call("Skill", skill))).toMatchObject({
      label: "Used skill frontend-design",
      literal: true,
    });
  });

  it("names MCP tools by tool and server, from either provider", () => {
    const input = { type: "unknown", input: { title: "Bug" }, output: null } as const;
    expect(toolChip(call("mcp__github__create_issue", input))).toMatchObject({
      action: "mcp",
      label: "Create issue",
      meta: "github",
    });
    expect(toolChip(call("linear.list_issues", input)).meta).toBe("linear");
  });
});
