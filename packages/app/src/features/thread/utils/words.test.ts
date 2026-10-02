import { describe, expect, it } from "vitest";
import { isSpace, splitWords } from "./words";

describe("splitWords", () => {
  it("keeps the whitespace so the pieces join back into the text", () => {
    const text = "Hello  brave\nnew world";
    expect(splitWords(text).join("")).toBe(text);
    expect(splitWords("a b")).toEqual(["a", " ", "b"]);
  });

  it("tells words from whitespace", () => {
    expect(isSpace(" \n")).toBe(true);
    expect(isSpace("word")).toBe(false);
  });
});
