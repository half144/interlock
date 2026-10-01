import type { ParsedDiffFile } from "@interlock/protocol/messages";
import type { DiffLine, FileDiff, Hunk } from "@/types";

export type DiffFilePayload = ParsedDiffFile;

type HunkPayload = DiffFilePayload["hunks"][number];

function toHunk(hunk: HunkPayload): Hunk {
  let oldNo = hunk.oldStart;
  let newNo = hunk.newStart;
  const lines: DiffLine[] = [];
  for (const line of hunk.lines) {
    if (line.type === "add") lines.push({ kind: "add", text: line.content, newNo: newNo++ });
    else if (line.type === "remove")
      lines.push({ kind: "del", text: line.content, oldNo: oldNo++ });
    else if (line.type === "context") {
      lines.push({ kind: "ctx", text: line.content, oldNo: oldNo++, newNo: newNo++ });
    }
  }
  return {
    header: `@@ -${hunk.oldStart},${hunk.oldCount} +${hunk.newStart},${hunk.newCount} @@`,
    lines,
  };
}

function statusOf(file: DiffFilePayload): FileDiff["status"] {
  if (file.isNew) return "added";
  return file.isDeleted ? "deleted" : "modified";
}

export function toFileDiffs(files: DiffFilePayload[]): FileDiff[] {
  return files.map((file) => ({
    path: file.path,
    ...(file.oldPath ? { oldPath: file.oldPath } : {}),
    additions: file.additions,
    deletions: file.deletions,
    status: statusOf(file),
    ...(file.status === "binary" || file.status === "too_large" ? { omitted: file.status } : {}),
    hunks: file.hunks.map(toHunk),
  }));
}
