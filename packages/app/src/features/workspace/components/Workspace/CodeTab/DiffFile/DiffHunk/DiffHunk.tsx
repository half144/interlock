import type { Hunk } from "@/types";
import { pairRows, type DiffMode } from "@/features/workspace/utils/diff";
import { LineAnnotations } from "./LineAnnotations/LineAnnotations";
import { SplitCell } from "./SplitCell/SplitCell";
import { UnifiedRow } from "./UnifiedRow/UnifiedRow";
import { useDiffHunk, type HunkRow } from "./useDiffHunk";

interface DiffHunkProps {
  agentId: string;
  path: string;
  hunk: Hunk;
  mode: DiffMode;
}

export function DiffHunk({ agentId, path, hunk, mode }: DiffHunkProps) {
  const { rows, compose } = useDiffHunk(path, hunk);
  const commentOn = (row: HunkRow | undefined) => {
    const key = row?.anchor?.key;
    return key ? () => compose(key) : undefined;
  };
  const anchorsOf = (...picked: (HunkRow | undefined)[]) =>
    picked.flatMap((row) => (row?.anchor ? [row.anchor] : []));

  return (
    <div>
      <div className="bg-inset px-3 py-1 font-mono text-[11px] text-ink-3">{hunk.header}</div>
      {mode === "unified"
        ? rows.map((row) => (
            <div key={row.id}>
              <UnifiedRow line={row.line} onComment={commentOn(row)} />
              <LineAnnotations agentId={agentId} anchors={anchorsOf(row)} />
            </div>
          ))
        : pairRows(rows).map(({ left, right }) => (
            <div key={`${left?.id ?? ""}-${right?.id ?? ""}`}>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] divide-x divide-seam">
                <SplitCell line={left?.line} side="old" onComment={commentOn(left)} />
                <SplitCell line={right?.line} side="new" onComment={commentOn(right)} />
              </div>
              <LineAnnotations agentId={agentId} anchors={anchorsOf(left, right)} />
            </div>
          ))}
    </div>
  );
}
