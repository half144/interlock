import type { ReviewComment } from "@/types";

const where = (comment: ReviewComment) =>
  `${comment.path}:${comment.line}${comment.side === "old" ? " (removed line)" : ""}`;

const inReadingOrder = (a: ReviewComment, b: ReviewComment) =>
  a.path.localeCompare(b.path) || a.line - b.line;

const codeOf = (comment: ReviewComment) =>
  comment.snippet.trim() ? comment.snippet : "(blank line)";

/** One follow-up for the whole review: each note with its `file:line` and the code it points at, file by file. */
export function reviewMessage(comments: ReviewComment[]): string {
  const notes = [...comments]
    .sort(inReadingOrder)
    .map(
      (comment, index) =>
        `${index + 1}. ${where(comment)}\n\`\`\`\n${codeOf(comment)}\n\`\`\`\n${comment.text}`,
    );
  const intro =
    comments.length === 1
      ? "I reviewed your changes and left a comment. Please address it:"
      : `I reviewed your changes and left ${comments.length} comments. Please address each one:`;
  return `${intro}\n\n${notes.join("\n\n")}`;
}
