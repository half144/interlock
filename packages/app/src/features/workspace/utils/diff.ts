import type { DiffLine, DiffMode, FileDiff, Hunk } from "@/types";

export type { DiffMode };

interface HasLine {
  line: DiffLine;
}

/** Lines up removals with the additions that replaced them, so split view reads old beside new. */
export function pairRows<T extends HasLine>(lines: T[]) {
  const rows: { left?: T | undefined; right?: T | undefined }[] = [];
  let dels: T[] = [];
  let adds: T[] = [];
  const flush = () => {
    for (let i = 0; i < Math.max(dels.length, adds.length); i++)
      rows.push({ left: dels[i], right: adds[i] });
    dels = [];
    adds = [];
  };
  for (const item of lines) {
    if (item.line.kind === "del") dels.push(item);
    else if (item.line.kind === "add") adds.push(item);
    else {
      flush();
      rows.push({ left: item, right: item });
    }
  }
  flush();
  return rows;
}

export const lineTone = {
  add: { bg: "bg-add/10", sign: "+", signClass: "text-add", text: "text-ink" },
  del: { bg: "bg-del/10", sign: "-", signClass: "text-del", text: "text-ink" },
  ctx: { bg: "", sign: " ", signClass: "", text: "text-ink-2" },
};

/** The class or function the changes sit in, from the scope git names in the hunk headers. */
export function symbolOf(file: FileDiff) {
  for (const hunk of file.hunks) {
    const name = hunk.header.match(/@@.*@@.*?(?:class|function|interface)\s+(\w+)/)?.[1];
    if (name) return name;
  }
  return null;
}

/** Past this many lines a diff opens cut short: mounting thousands of rows holds the panel up for a second. */
export const FIRST_DIFF_LINES = 400;

/** The first `max` lines of a file's hunks, and how many lines were left out. */
export function capHunks(hunks: Hunk[], max: number) {
  let room = max;
  let hidden = 0;
  const shown: Hunk[] = [];
  for (const hunk of hunks) {
    const kept = hunk.lines.slice(0, Math.max(0, room));
    room -= kept.length;
    hidden += hunk.lines.length - kept.length;
    if (kept.length)
      shown.push(kept.length === hunk.lines.length ? hunk : { ...hunk, lines: kept });
  }
  return { shown, hidden };
}
