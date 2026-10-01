import type { FileDiff } from "@/types";
import type { DiffMode } from "@/features/workspace/utils/diff";
import { DiffHunk } from "./DiffHunk/DiffHunk";
import { OmittedDiff } from "./OmittedDiff/OmittedDiff";

interface DiffFileProps {
  agentId: string;
  file: FileDiff;
  mode: DiffMode;
}

/** One file's hunks, in unified or split view, with review notes threaded under the lines they're on. */
export function DiffFile({ agentId, file, mode }: DiffFileProps) {
  if (file.omitted) return <OmittedDiff reason={file.omitted} />;

  return (
    <section className="border-b border-seam">
      <div className={mode === "unified" ? "w-max min-w-full py-1" : "w-full py-1"}>
        {file.hunks.map((hunk) => (
          <DiffHunk key={hunk.header} agentId={agentId} path={file.path} hunk={hunk} mode={mode} />
        ))}
      </div>
    </section>
  );
}
