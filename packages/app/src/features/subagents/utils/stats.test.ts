import { describe, expect, it } from "vitest";
import type { Agent, Subagent } from "@/types";
import { statusLine } from "./stats";

const agent = { aspect: "idle", createdAt: 0, updatedAt: 200_000 } as Agent;

describe("statusLine", () => {
  it("ends a finished run with its tool uses and time", () => {
    const sub = {
      status: "done",
      startSec: 10,
      endSec: 72,
      events: [
        { kind: "read", text: "a", sec: 11 },
        { kind: "note", text: "x", sec: 12 },
      ],
    } as Subagent;
    expect(statusLine(sub, agent)).toBe("Done · 1 tool use · 1m 02s");
    expect(statusLine({ ...sub, status: "failed" }, agent)).toContain("Failed");
  });
});
