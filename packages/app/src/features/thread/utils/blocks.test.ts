import { describe, expect, it } from "vitest";
import { keyBlocks } from "./blocks";

describe("keyBlocks", () => {
  it("names each block by its type and place", () => {
    const keyed = keyBlocks([
      { type: "text", text: "a" },
      { type: "text", text: "b" },
      { type: "reasoning", text: "c" },
    ]);
    expect(keyed.map((k) => k.key)).toEqual(["text-0", "text-1", "reasoning-2"]);
    expect(keyed.map((k) => k.position)).toEqual([0, 1, 2]);
  });
});
