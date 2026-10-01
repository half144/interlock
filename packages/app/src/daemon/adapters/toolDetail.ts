import type { DiffLine, ToolChip, ToolDetail } from "@/types";

/** Enough to read what happened; the store keeps every call, so long output is cut. */
const MAX_LINES = 400;
const MAX_CHARS = 24_000;

export function clip(text: string): string {
  const lines = text.replace(/\n+$/, "").split("\n");
  const kept = lines.slice(0, MAX_LINES).join("\n").slice(0, MAX_CHARS);
  return kept.length < lines.join("\n").length ? `${kept}\n…` : kept;
}

export const textDetail = (text: string | undefined): ToolDetail | undefined =>
  text?.trim() ? { type: "text", text: clip(text) } : undefined;

const line = (kind: DiffLine["kind"]) => (text: string) => ({ kind, text });

/** The lines an edit swapped out and in, between the lines both sides share. */
export function replacementLines(before: string, after: string): DiffLine[] {
  const old = before === "" ? [] : before.split("\n");
  const next = after === "" ? [] : after.split("\n");
  let start = 0;
  while (start < old.length && start < next.length && old[start] === next[start]) start++;
  let end = 0;
  const shared = Math.min(old.length, next.length) - start;
  while (end < shared && old[old.length - 1 - end] === next[next.length - 1 - end]) end++;
  return [
    ...old.slice(0, start).map(line("ctx")),
    ...old.slice(start, old.length - end).map(line("del")),
    ...next.slice(start, next.length - end).map(line("add")),
    ...next.slice(next.length - end).map(line("ctx")),
  ];
}

const DIFF_HEADER = /^(diff |index |--- |\+\+\+ |new file|deleted file)/;

/** A patch's lines; hunks after the first are set apart by a quiet ellipsis line. */
export function unifiedLines(diff: string): DiffLine[] {
  const body = diff
    .replace(/\n+$/, "")
    .split("\n")
    .filter((text) => !DIFF_HEADER.test(text));
  return (body[0]?.startsWith("@@") ? body.slice(1) : body).map((text): DiffLine => {
    if (text.startsWith("@@")) return { kind: "ctx", text: "⋯" };
    if (text.startsWith("+")) return { kind: "add", text: text.slice(1) };
    if (text.startsWith("-")) return { kind: "del", text: text.slice(1) };
    return { kind: "ctx", text: text.startsWith(" ") ? text.slice(1) : text };
  });
}

/** The stat and the diff a call shows for the lines it changed. */
export function changed(lines: DiffLine[]): Pick<ToolChip, "stat" | "detail"> {
  if (lines.length === 0) return {};
  return {
    stat: {
      additions: lines.filter((l) => l.kind === "add").length,
      deletions: lines.filter((l) => l.kind === "del").length,
    },
    detail: { type: "diff", lines: lines.slice(0, MAX_LINES) },
  };
}

export function errorText(error: unknown): string | undefined {
  if (error === null || error === undefined) return undefined;
  if (typeof error === "string") return error;
  if (typeof error === "object" && "content" in error && typeof error.content === "string") {
    return error.content;
  }
  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return JSON.stringify(error, null, 2);
}

/** Claude reports a failed command as `Exit code 1` followed by what it printed. */
const EXIT_LINE = /^Exit code (\d+)\n?/;

export function exitOf(
  exitCode: number | null | undefined,
  error: string | undefined,
): { code?: number; output?: string } {
  const match = error === undefined ? null : EXIT_LINE.exec(error);
  const code = exitCode ?? (match ? Number(match[1]) : undefined);
  const output = match && error !== undefined ? error.slice(match[0].length) : error;
  return { ...(code === undefined ? {} : { code }), ...(output ? { output } : {}) };
}
