import { describe, expect, it } from "vitest";
import type { Subagent, SubagentEvent } from "@/types";
import { recentCalls } from "./calls";

const sub = (events: SubagentEvent[]) => ({ events }) as Subagent;
const call = (text: string): SubagentEvent => ({ kind: "read", text, sec: 0 });

describe("recentCalls", () => {
  it("shows the last three calls and counts the rest", () => {
    const result = recentCalls(
      sub([
        call("a"),
        { kind: "note", text: "hi", sec: 1 },
        call("b"),
        call("c"),
        call("d"),
        call("e"),
      ]),
    );
    expect(result.shown.map((c) => c.text)).toEqual(["c", "d", "e"]);
    expect(result.hidden).toBe(2);
  });

  it("has nothing hidden for a short run", () => {
    expect(recentCalls(sub([call("a")]))).toEqual({ shown: [call("a")], hidden: 0 });
  });
});
