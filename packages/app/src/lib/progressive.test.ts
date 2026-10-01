import { describe, expect, it } from "vitest";
import { progressive } from "./progressive";

describe("progressive", () => {
  it("puts every phrase's verb in the present", () => {
    expect(progressive("Ran tests")).toBe("Running tests");
    expect(progressive("Edited package.json and ran tests")).toBe(
      "Editing package.json and running tests",
    );
    expect(progressive("Searched for “x” in src, listed docs and read the git log")).toBe(
      "Searching for “x” in src, listing docs and reading the git log",
    );
  });

  it("leaves targets and unknown words alone", () => {
    expect(progressive("Read a.ts, Read.md and 2 more")).toBe("Reading a.ts, Read.md and 2 more");
    expect(progressive("Create issue")).toBe("Create issue");
  });
});
