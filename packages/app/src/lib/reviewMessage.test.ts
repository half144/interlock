import { describe, expect, it } from "vitest";
import type { ReviewComment } from "@/types";
import { reviewMessage } from "./reviewMessage";

const comment = (patch: Partial<ReviewComment>): ReviewComment => ({
  id: "c",
  path: "src/a.ts",
  line: 3,
  side: "new",
  snippet: "const a = 1;",
  text: "Rename this.",
  ...patch,
});

describe("reviewMessage", () => {
  it("puts file:line, the snippet and the note of one comment in one message", () => {
    expect(reviewMessage([comment({})])).toBe(
      "I reviewed your changes and left a comment. Please address it:\n\n" +
        "1. src/a.ts:3\n```\nconst a = 1;\n```\nRename this.",
    );
  });

  it("lists the notes file by file, top to bottom, and says so for a blank line", () => {
    const message = reviewMessage([
      comment({ id: "1", path: "b.ts", line: 1, text: "third" }),
      comment({ id: "2", path: "a.ts", line: 9, text: "second" }),
      comment({ id: "3", path: "a.ts", line: 2, snippet: "  ", text: "first" }),
    ]);
    expect(message.indexOf("first")).toBeLessThan(message.indexOf("second"));
    expect(message.indexOf("second")).toBeLessThan(message.indexOf("third"));
    expect(message).toContain("1. a.ts:2\n```\n(blank line)\n```\nfirst");
  });

  it("numbers several comments and marks removed lines", () => {
    const message = reviewMessage([
      comment({}),
      comment({ id: "d", path: "b.ts", line: 9, side: "old", snippet: "old()", text: "Why gone?" }),
    ]);
    expect(message).toContain("left 2 comments");
    expect(message).toContain("2. src/a.ts:3\n");
    expect(message).toContain("1. b.ts:9 (removed line)\n```\nold()\n```\nWhy gone?");
  });
});
