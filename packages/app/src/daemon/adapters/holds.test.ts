import { describe, expect, it } from "vitest";
import type { AgentPermissionRequest } from "@interlock/protocol/agent-types";
import {
  answersResponse,
  hasResumeAction,
  holdResponse,
  permissionToHold,
  planResponse,
} from "./holds";

const base = { id: "r1", provider: "claude" } as const;

describe("permissionToHold", () => {
  it("carries the real command of a shell approval", () => {
    const request: AgentPermissionRequest = {
      ...base,
      name: "Bash",
      kind: "tool",
      detail: { type: "shell", command: "rm -rf build" },
    };
    const hold = permissionToHold(request);
    expect(hold).toMatchObject({
      requestId: "r1",
      kind: "approval",
      title: "Run a command",
      command: "rm -rf build",
      options: ["Allow", "Deny"],
    });
  });

  it("carries the file of an edit approval", () => {
    const hold = permissionToHold({
      ...base,
      name: "Edit",
      kind: "tool",
      detail: { type: "edit", filePath: "src/a.ts" },
    });
    expect(hold).toMatchObject({ title: "Edit src/a.ts", file: "src/a.ts" });
  });

  it("builds a plan hold from allow actions", () => {
    const hold = permissionToHold({
      ...base,
      name: "Plan",
      kind: "plan",
      input: { plan: "1. do it" },
      actions: [
        { id: "implement", label: "Implement", behavior: "allow" },
        { id: "dismiss", label: "Dismiss", behavior: "deny" },
      ],
    });
    expect(hold).toMatchObject({ kind: "plan", plan: "1. do it", options: ["Implement", "Deny"] });
  });

  it("parses questions tolerantly", () => {
    const hold = permissionToHold({
      ...base,
      name: "Ask",
      kind: "question",
      input: {
        questions: [
          {
            header: "Cart",
            question: "Restore?",
            options: [{ label: "Yes" }, { label: "No", description: "d" }],
          },
        ],
      },
    });
    expect(hold.questions).toEqual([
      {
        header: "Cart",
        question: "Restore?",
        options: [{ label: "Yes" }, { label: "No", description: "d" }],
        multiSelect: false,
      },
    ]);
    expect(hold.options).toEqual(["Yes", "No", "Deny"]);
  });
});

describe("holdResponse", () => {
  const question = permissionToHold({
    ...base,
    name: "Ask",
    kind: "question",
    input: { questions: [{ header: "Cart", question: "Restore?", options: [{ label: "Yes" }] }] },
  });

  it("answers a question under its header, keeping the input", () => {
    expect(holdResponse(question, "Yes")).toEqual({
      behavior: "allow",
      updatedInput: { questions: question.input?.["questions"], answers: { Cart: "Yes" } },
    });
  });

  it("denies with the right message", () => {
    expect(holdResponse(question, "Deny")).toEqual({
      behavior: "deny",
      message: "Dismissed by user",
    });
    const approval = permissionToHold({ ...base, name: "Bash", kind: "tool" });
    expect(holdResponse(approval, "Deny")).toEqual({ behavior: "deny", message: "Denied by user" });
    expect(holdResponse(approval, "Allow")).toEqual({ behavior: "allow" });
  });

  it("selects the action by label", () => {
    const plan = permissionToHold({
      ...base,
      name: "Plan",
      kind: "plan",
      actions: [{ id: "implement", label: "Implement", behavior: "allow" }],
    });
    expect(holdResponse(plan, "Implement")).toEqual({
      behavior: "allow",
      selectedActionId: "implement",
    });
  });
});

describe("answersResponse", () => {
  it("answers every question by its header, keeping the original input", () => {
    const hold = permissionToHold({
      ...base,
      name: "AskUserQuestion",
      kind: "question",
      input: { questions: [{ header: "a", question: "A?", options: [], multiSelect: false }] },
    });
    expect(answersResponse(hold, { a: "yes", b: "no" })).toEqual({
      behavior: "allow",
      updatedInput: { ...hold.input, answers: { a: "yes", b: "no" } },
    });
  });
});

describe("planResponse", () => {
  const request = (resume: boolean) =>
    permissionToHold({
      ...base,
      name: "Plan",
      kind: "plan",
      actions: [
        { id: "reject", label: "Reject", behavior: "deny" },
        { id: "implement", label: "Implement", behavior: "allow" },
        ...(resume
          ? [
              {
                id: "implement_resume",
                label: "Implement with Full access",
                behavior: "allow" as const,
              },
            ]
          : []),
      ],
    });

  it("approves with the implement action and rejects with the deny action", () => {
    expect(planResponse(request(false), "approve")).toEqual({
      behavior: "allow",
      selectedActionId: "implement",
    });
    expect(planResponse(request(false), "reject")).toEqual({
      behavior: "deny",
      selectedActionId: "reject",
    });
  });

  it("uses the resume action for full auto when the daemon offers it", () => {
    expect(hasResumeAction(request(true))).toBe(true);
    expect(planResponse(request(true), "full-auto")).toEqual({
      behavior: "allow",
      selectedActionId: "implement_resume",
    });
    expect(hasResumeAction(request(false))).toBe(false);
    expect(planResponse(request(false), "full-auto")).toEqual({
      behavior: "allow",
      selectedActionId: "implement",
    });
  });
});

describe("question flags", () => {
  it("keeps free-text hints", () => {
    const hold = permissionToHold({
      ...base,
      name: "Ask",
      kind: "question",
      input: {
        questions: [
          {
            header: "url",
            question: "Where?",
            options: [],
            placeholder: "git@x",
            allowEmpty: true,
          },
        ],
      },
    });
    expect(hold.questions?.[0]).toMatchObject({ allowEmpty: true, placeholder: "git@x" });
  });
});
