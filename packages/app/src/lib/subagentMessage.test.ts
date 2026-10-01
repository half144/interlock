import { describe, expect, it } from "vitest";
import { aboutSubagent } from "./subagentMessage";

describe("aboutSubagent", () => {
  it("names the subagent before the message", () => {
    expect(aboutSubagent("Explore the repo", "Also check the tests")).toBe(
      'About subagent "Explore the repo":\n\nAlso check the tests',
    );
  });
});
