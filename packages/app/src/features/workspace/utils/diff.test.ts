import { describe, expect, it } from "vitest";
import type { DiffLine, FileDiff } from "@/types";
import { pairRows, symbolOf } from "./diff";

const del = (text: string): { line: DiffLine } => ({ line: { kind: "del", text } });
const add = (text: string): { line: DiffLine } => ({ line: { kind: "add", text } });
const ctx = (text: string): { line: DiffLine } => ({ line: { kind: "ctx", text } });

describe("pairRows", () => {
  it("sets each removal beside the addition that replaced it", () => {
    const [a, b, c] = [del("old1"), del("old2"), add("new1")];
    expect(pairRows([a, b, c])).toEqual([
      { left: a, right: c },
      { left: b, right: undefined },
    ]);
  });

  it("puts a context line on both sides and flushes pending changes before it", () => {
    const [removed, same] = [del("x"), ctx("same")];
    expect(pairRows([removed, same])).toEqual([
      { left: removed, right: undefined },
      { left: same, right: same },
    ]);
  });
});

describe("symbolOf", () => {
  const file = (header: string): FileDiff => ({
    path: "a.ts",
    additions: 0,
    deletions: 0,
    status: "modified",
    hunks: [{ header, lines: [] }],
  });

  it("names the function or class a hunk sits in", () => {
    expect(symbolOf(file("@@ -1,3 +1,4 @@ export function hello(name) {"))).toBe("hello");
    expect(symbolOf(file("@@ -1,3 +1,4 @@"))).toBeNull();
  });
});
