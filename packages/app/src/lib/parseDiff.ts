import type { DiffLine, FileDiff, Hunk } from "@/types";

/**
 * Parses a compact unified diff body (lines prefixed with ' ', '+', '-', or '@@ -a,b +c,d @@')
 * into hunks with old/new line numbers.
 */
export function parseDiff(
  path: string,
  body: string,
  status: FileDiff["status"] = "modified",
): FileDiff {
  const hunks: Hunk[] = [];
  let oldNo = 0;
  let newNo = 0;
  let additions = 0;
  let deletions = 0;

  for (const raw of body
    .replace(/^\n/, "")
    .replace(/\n\s*$/, "")
    .split("\n")) {
    const header = raw.match(/^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@(.*)$/);
    if (header) {
      oldNo = Number(header[1]);
      newNo = Number(header[2]);
      hunks.push({ header: raw, lines: [] });
      continue;
    }
    const sign = raw[0];
    const text = raw.slice(1);
    let line: DiffLine;
    if (sign === "+") {
      line = { kind: "add", text, newNo: newNo++ };
      additions++;
    } else if (sign === "-") {
      line = { kind: "del", text, oldNo: oldNo++ };
      deletions++;
    } else {
      line = { kind: "ctx", text, oldNo: oldNo++, newNo: newNo++ };
    }
    hunks.at(-1)?.lines.push(line);
  }

  return { path, status, additions, deletions, hunks };
}
