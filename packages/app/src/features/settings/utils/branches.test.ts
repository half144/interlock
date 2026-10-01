import { describe, expect, it } from "vitest";
import { withCurrent } from "./branches";

describe("withCurrent", () => {
  it("keeps the list when it has the current branch and adds it otherwise", () => {
    expect(withCurrent(["main", "dev"], "dev")).toEqual(["main", "dev"]);
    expect(withCurrent(["main"], "gone")).toEqual(["gone", "main"]);
  });
});
