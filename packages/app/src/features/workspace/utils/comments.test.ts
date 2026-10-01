import { describe, expect, it } from "vitest";
import type { DiffLine, ReviewComment } from "@/types";
import { anchorKey, anchorOf, anchored, commentsAt } from "./comments";

const add: DiffLine = { kind: "add", text: "new()", newNo: 5 };
const del: DiffLine = { kind: "del", text: "old()", oldNo: 4 };
const ctx: DiffLine = { kind: "ctx", text: "same()", oldNo: 6, newNo: 7 };

describe("anchorOf", () => {
  it("addresses removed lines in the old file and every other line in the new one", () => {
    expect(anchorOf(add)).toEqual({ line: 5, side: "new" });
    expect(anchorOf(del)).toEqual({ line: 4, side: "old" });
    expect(anchorOf(ctx)).toEqual({ line: 7, side: "new" });
  });

  it("has no anchor for a line without a number", () => {
    expect(anchorOf({ kind: "add", text: "x" })).toBeNull();
  });
});

describe("anchored", () => {
  it("carries the line's code as the snippet", () => {
    expect(anchored("src/a.ts", add)).toEqual({
      key: "src/a.ts:new:5",
      draft: { path: "src/a.ts", line: 5, side: "new", snippet: "new()" },
    });
  });
});

describe("commentsAt", () => {
  const note = (path: string, line: number, side: "new" | "old"): ReviewComment => ({
    id: `${path}${line}${side}`,
    path,
    line,
    side,
    snippet: "",
    text: "t",
  });

  it("picks the comments on the given lines of the given file", () => {
    const all = [note("a.ts", 5, "new"), note("a.ts", 5, "old"), note("b.ts", 5, "new")];
    expect(commentsAt(all, [anchorKey("a.ts", { line: 5, side: "new" })])).toEqual([all[0]]);
  });
});
