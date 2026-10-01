import { describe, expect, it } from "vitest";
import { linesOf, outsideRepo } from "./lines";

describe("linesOf", () => {
  it("trims and drops blank lines", () => {
    expect(linesOf("  npm ci \n\n  npm run build\n")).toEqual(["npm ci", "npm run build"]);
  });
});

describe("outsideRepo", () => {
  it("finds the first path that leaves the repo", () => {
    expect(outsideRepo([".env", "config/local.json"])).toBeUndefined();
    expect(outsideRepo([".env", "/etc/hosts"])).toBe("/etc/hosts");
    expect(outsideRepo(["../secret"])).toBe("../secret");
    expect(outsideRepo(["C:\\x"])).toBe("C:\\x");
  });
});
