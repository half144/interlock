import { describe, expect, it } from "vitest";
import { badName, savableEnv } from "./env";

describe("savableEnv", () => {
  it("drops unnamed rows and lets the last duplicate win", () => {
    expect(
      savableEnv([
        ["A", "1"],
        ["", "x"],
        [" B ", "2"],
        ["A", "3"],
      ]),
    ).toEqual([
      ["A", "3"],
      ["B", "2"],
    ]);
  });
});

describe("badName", () => {
  it("flags names a shell cannot export", () => {
    expect(
      badName([
        ["OK_1", ""],
        ["", ""],
      ]),
    ).toBeUndefined();
    expect(badName([["1BAD", ""]])).toBe("1BAD");
    expect(badName([["with space", ""]])).toBe("with space");
  });
});
