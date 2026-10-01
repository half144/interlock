import type { Hunk } from "@/types";
import type { ReviewNotes } from "@/features/workspace/hooks/useReviewComments";
import { lineKey, pairRows, type DiffMode } from "@/features/workspace/utils/diff";
import { LineAnnotations } from "./LineAnnotations/LineAnnotations";
import { SplitCell } from "./SplitCell/SplitCell";
import { UnifiedRow } from "./UnifiedRow/UnifiedRow";

interface DiffHunkProps extends ReviewNotes {
  hunk: Hunk;
  fileIndex: number;
  hunkIndex: number;
  mode: DiffMode;
}

export function DiffHunk({ hunk, fileIndex, hunkIndex, mode, ...notes }: DiffHunkProps) {
  const keyed = hunk.lines.map((line, li) => ({ line, key: lineKey(fileIndex, hunkIndex, li) }));

  return (
    <div>
      <div className="bg-inset px-3 py-1 font-mono text-[11px] text-ink-3">{hunk.header}</div>
      {mode === "unified"
        ? keyed.map(({ line, key }) => (
            <div key={key}>
              <UnifiedRow line={line} onComment={() => notes.onCompose(key)} />
              <LineAnnotations keys={[key]} {...notes} />
            </div>
          ))
        : pairRows(keyed).map(({ left, right }) => (
            <div key={(left?.key ?? "") + (right?.key ?? "")}>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] divide-x divide-seam">
                <SplitCell
                  line={left?.line}
                  side="old"
                  onComment={left ? () => notes.onCompose(left.key) : undefined}
                />
                <SplitCell
                  line={right?.line}
                  side="new"
                  onComment={right ? () => notes.onCompose(right.key) : undefined}
                />
              </div>
              <LineAnnotations
                keys={[left?.key, right?.key].filter((k): k is string => Boolean(k))}
                {...notes}
              />
            </div>
          ))}
    </div>
  );
}
