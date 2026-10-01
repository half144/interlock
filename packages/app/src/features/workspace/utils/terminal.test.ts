import { describe, expect, it } from "vitest";
import { homeRelative } from "./terminal";

describe("homeRelative", () => {
  it("shortens the home folder to a tilde", () => {
    expect(homeRelative("/Users/ana/.interlock/worktrees/app/fix")).toBe(
      "~/.interlock/worktrees/app/fix",
    );
    expect(homeRelative("/home/ana/code")).toBe("~/code");
  });

  it("leaves other paths alone", () => {
    expect(homeRelative("/private/tmp/x")).toBe("/private/tmp/x");
  });
});
