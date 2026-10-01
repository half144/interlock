import { describe, expect, it } from "vitest";
import type { Agent } from "@/types";
import { projectsNeedingYou } from "./attention";

const agent = (projectId: string, aspect: Agent["aspect"]) => ({ projectId, aspect }) as Agent;

describe("projectsNeedingYou", () => {
  it("lists projects with a held or failed task only", () => {
    const set = projectsNeedingYou({
      a: agent("p1", "held"),
      b: agent("p2", "running"),
      c: agent("p3", "failed"),
      d: agent("p1", "review"),
    });
    expect([...set].sort()).toEqual(["p1", "p3"]);
  });
});
