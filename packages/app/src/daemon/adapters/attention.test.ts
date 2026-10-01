import { describe, expect, it } from "vitest";
import type { Agent } from "@/types";
import { activityOf, toNotice } from "./attention";

const agent = (patch: Partial<Agent>): Agent => ({
  id: "a1",
  headcode: "a1",
  projectId: "p",
  workspaceId: null,
  threadId: "a1",
  cwd: "/",
  title: "Fix it",
  branch: "",
  base: "main",
  kind: "claude",
  model: "m",
  modelId: null,
  aspect: "running",
  step: "",
  createdAt: 0,
  updatedAt: 0,
  turnStartedAt: null,
  tokens: 0,
  additions: 0,
  deletions: 0,
  files: [],
  unseen: 0,
  mode: "auto",
  modeId: null,
  ...patch,
});

describe("toNotice", () => {
  it("names the real command, the failure or the review", () => {
    const held = agent({
      hold: {
        requestId: "r",
        kind: "approval",
        title: "Run a command",
        detail: "",
        command: "rm x",
      },
    });
    expect(toNotice(held, "permission")).toEqual({
      title: "Fix it",
      body: "Needs you: rm x",
      taskId: "a1",
    });
    expect(toNotice(agent({ error: "boom" }), "error")?.body).toBe("Failed: boom");
    expect(toNotice(agent({}), "finished")?.body).toBe("Ready for review");
  });
});

describe("activityOf", () => {
  it("counts running and waiting", () => {
    const list = [
      agent({ aspect: "running" }),
      agent({ aspect: "held" }),
      agent({ aspect: "failed" }),
      agent({ aspect: "review" }),
      agent({ aspect: "idle" }),
    ];
    expect(activityOf(list)).toEqual({ running: 1, waiting: 3 });
  });
});
