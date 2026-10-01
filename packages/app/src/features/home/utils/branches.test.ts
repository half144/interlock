import { describe, expect, it } from "vitest";
import { orderBranches } from "./branches";

describe("orderBranches", () => {
  it("puts the default branch first and drops repeats", () => {
    expect(orderBranches("main", ["feat/a", "main", "feat/b"], "")).toEqual([
      "main",
      "feat/a",
      "feat/b",
    ]);
  });

  it("leaves the default out when it does not match the query", () => {
    expect(orderBranches("main", ["feat/a"], "feat")).toEqual(["feat/a"]);
    expect(orderBranches("main", ["main"], "MA")).toEqual(["main"]);
  });
});
