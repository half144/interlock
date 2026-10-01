import { describe, expect, it } from "vitest";
import type { ToolChip } from "@/types";
import { exploreSummary, groupTools } from "./toolGroups";

const chip = (callId: string, patch: Partial<ToolChip> = {}): ToolChip => ({
  callId,
  action: "run",
  verb: "Ran",
  label: "Ran",
  status: "done",
  ...patch,
});

const read = (callId: string, ...files: string[]) =>
  chip(callId, { action: "read", explored: { files, looks: [] } });

const looked = (callId: string, look: "search" | "list" | "git", patch: Partial<ToolChip> = {}) =>
  chip(callId, { action: look, explored: { files: [], looks: [look] }, ...patch });

describe("groupTools", () => {
  it("folds a run of exploration and leaves the rest as calls", () => {
    const groups = groupTools([
      read("a", "x.ts"),
      read("b", "y.ts"),
      chip("c", { action: "test" }),
      read("d", "z.ts"),
    ]);
    expect(groups.map((g) => [g.type, g.key])).toEqual([
      ["explore", "explore:a"],
      ["call", "call:c"],
      ["call", "call:d"],
    ]);
  });

  it("tells a running or failing run apart", () => {
    const [group] = groupTools([
      read("a", "x.ts"),
      looked("b", "search", { status: "failed" }),
      read("c", "y.ts"),
    ]);
    expect(group).toMatchObject({ running: false, failures: 1 });
    const [live] = groupTools([read("a"), read("b", "y.ts"), { ...read("c"), status: "running" }]);
    expect(live).toMatchObject({ running: true });
  });
});

describe("exploreSummary", () => {
  it("counts distinct files, searches, folders and git", () => {
    expect(
      exploreSummary([
        read("a", "x.ts", "y.ts"),
        read("b", "x.ts"),
        looked("c", "search"),
        looked("d", "search"),
        looked("e", "git"),
      ]),
    ).toBe("Read 2 files, searched twice and checked git");
    expect(
      exploreSummary([
        chip("a", { action: "explore", explored: { files: [], looks: ["list", "search"] } }),
      ]),
    ).toBe("Searched once and listed 1 folder");
    expect(exploreSummary([chip("a", { action: "other" })])).toBe("Explored the project");
  });
});
