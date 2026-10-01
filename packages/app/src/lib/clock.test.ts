import { describe, expect, it } from "vitest";
import type { Agent, Subagent } from "@/types";
import { elapsedOf, taskClock } from "./clock";

const agent = (aspect: Agent["aspect"]) =>
  ({ aspect, createdAt: 1_000_000, updatedAt: 1_090_000 }) as Agent;

describe("taskClock", () => {
  it("counts to now while the task is live", () => {
    expect(taskClock(agent("running"), 1_030_000)).toBe(30);
  });

  it("stops at the last update once the task is settled", () => {
    expect(taskClock(agent("review"), 9_999_999)).toBe(90);
  });
});

describe("elapsedOf", () => {
  const sub = { status: "running", startSec: 10 } as Subagent;

  it("measures a running subagent against the task clock", () => {
    expect(elapsedOf(sub, agent("running"))).toBeGreaterThan(0);
    expect(elapsedOf({ ...sub, status: "done", endSec: 25 }, agent("review"))).toBe(15);
    expect(elapsedOf({ ...sub, status: "queued" }, agent("running"))).toBe(0);
  });
});
