import { describe, expect, it } from "vitest";
import { advance, countWords, paceStep, wordsPerSecond } from "./pacing";

describe("advance", () => {
  const text = "one two  three four";

  it("moves a whole number of words and stops at the end of a word", () => {
    expect(advance(text, 0, 1)).toBe(3);
    expect(advance(text, 0, 2)).toBe(7);
    expect(advance(text, 3, 1)).toBe(7);
  });

  it("stops at the end of the text", () => {
    expect(advance(text, 0, 99)).toBe(text.length);
    expect(advance(text, text.length, 3)).toBe(text.length);
  });

  it("finishes a word that was cut short", () => {
    expect(advance("hello world", 3, 1)).toBe(5);
  });
});

describe("countWords", () => {
  it("counts what is left to show", () => {
    expect(countWords("one two three", 0)).toBe(3);
    expect(countWords("one two three", 7)).toBe(1);
    expect(countWords("one two ", 8)).toBe(0);
  });
});

describe("wordsPerSecond", () => {
  it("reads steadily when nothing is waiting and speeds up as text piles up", () => {
    expect(wordsPerSecond(0)).toBe(24);
    expect(wordsPerSecond(10)).toBe(54);
    expect(wordsPerSecond(10_000)).toBe(220);
  });
});

describe("paceStep", () => {
  const text = "one two three four";

  it("holds still until a whole word is owed, and carries the remainder", () => {
    const first = paceStep(text, 0, 0, 20);
    expect(first.to).toBe(0);
    const second = paceStep(text, 0, first.owed, 40);
    expect(second.to).toBe(7);
    expect(second.owed).toBeLessThan(1);
  });

  it("keeps moving when text arrives after it caught up", () => {
    const caught = paceStep("one two", 0, 0, 1000);
    expect(caught.to).toBe(7);
    expect(paceStep("one two three", caught.to, caught.owed, 100).to).toBe(13);
  });
});
