import type { FileDiff } from "@/types";
import type { ReviewNotes } from "@/features/workspace/hooks/useReviewComments";
import type { DiffMode } from "@/features/workspace/utils/diff";
import { DiffHunk } from "./DiffHunk/DiffHunk";

interface DiffFileProps extends ReviewNotes {
  file: FileDiff;
  index: number;
  mode: DiffMode;
}

/** One file's hunks, in unified or split view, with review notes threaded under the lines they're on. */
export function DiffFile({ file, index, mode, ...notes }: DiffFileProps) {
  return (
    <section className="border-b border-seam">
      <div className={mode === "unified" ? "w-max min-w-full py-1" : "w-full py-1"}>
        {file.hunks.map((hunk, hi) => (
          <DiffHunk
            key={hunk.header}
            hunk={hunk}
            fileIndex={index}
            hunkIndex={hi}
            mode={mode}
            {...notes}
          />
        ))}
      </div>
    </section>
  );
}
