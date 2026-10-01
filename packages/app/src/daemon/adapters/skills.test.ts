import { describe, expect, it } from "vitest";
import { toSkills } from "./skills";

describe("toSkills", () => {
  it("keeps only skills, sorted by name", () => {
    const commands = [
      { name: "review", description: "Review a diff", kind: "skill" },
      { name: "compact", description: "Compact the context", kind: "command" },
      { name: "a11y-audit", description: "Audit accessibility", kind: "skill" },
    ];
    expect(toSkills({ commands, error: null })).toEqual([
      { name: "a11y-audit", description: "Audit accessibility" },
      { name: "review", description: "Review a diff" },
    ]);
  });

  it("surfaces the daemon's error instead of an empty list", () => {
    expect(() => toSkills({ commands: [], error: "Agent not found" })).toThrow("Agent not found");
  });
});
