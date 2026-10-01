import { describe, expect, it } from "vitest";
import { withSkill } from "./skillPrompt";

const skills = ["review", "a11y-audit"];

describe("withSkill", () => {
  it("puts the skill at the start of the prompt", () => {
    expect(withSkill("", "review", skills)).toBe("/review ");
    expect(withSkill("fix the login", "review", skills)).toBe("/review fix the login");
  });

  it("replaces a skill that is already there", () => {
    expect(withSkill("/review fix the login", "a11y-audit", skills)).toBe(
      "/a11y-audit fix the login",
    );
  });

  it("keeps a leading slash word that is not a skill", () => {
    expect(withSkill("/tmp is full", "review", skills)).toBe("/review /tmp is full");
  });
});
