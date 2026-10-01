import type { DiffLine, ReviewComment } from "@/types";

export interface Anchor {
  line: number;
  side: ReviewComment["side"];
}

/** Where a note on this diff line lives: a removed line is addressed in the old file, every other in the new. */
export function anchorOf(line: DiffLine): Anchor | null {
  if (line.kind === "del")
    return line.oldNo === undefined ? null : { line: line.oldNo, side: "old" };
  return line.newNo === undefined ? null : { line: line.newNo, side: "new" };
}

export const anchorKey = (path: string, { line, side }: Anchor) => `${path}:${side}:${line}`;

const commentKey = (comment: ReviewComment) => anchorKey(comment.path, comment);

/** A line that can take a note: its key, and the comment minus the words the reviewer is about to write. */
export interface Anchored {
  key: string;
  draft: Omit<ReviewComment, "id" | "text">;
}

export function anchored(path: string, line: DiffLine): Anchored | null {
  const anchor = anchorOf(line);
  return anchor && { key: anchorKey(path, anchor), draft: { path, ...anchor, snippet: line.text } };
}

export const commentsAt = (comments: ReviewComment[], keys: string[]) =>
  comments.filter((comment) => keys.includes(commentKey(comment)));
