import type { FileDiff } from "@/types";
import type { DiffMode } from "@/features/workspace/utils/diff";
import { Button } from "@/components/ui/Button/Button";
import { plural } from "@/lib/utils";
import { DiffHunk } from "./DiffHunk/DiffHunk";
import { OmittedDiff } from "./OmittedDiff/OmittedDiff";
import { useDiffFile } from "./useDiffFile";

interface DiffFileProps {
  agentId: string;
  file: FileDiff;
  mode: DiffMode;
}

/** One file's hunks, in unified or split view, with review notes threaded under the lines they're on. */
export function DiffFile({ agentId, file, mode }: DiffFileProps) {
  const { hunks, hidden, showAll } = useDiffFile(file);
  if (file.omitted) return <OmittedDiff reason={file.omitted} />;

  return (
    <section className="border-b border-seam">
      <div className={mode === "unified" ? "w-max min-w-full py-1" : "w-full py-1"}>
        {hunks.map((hunk) => (
          <DiffHunk key={hunk.header} agentId={agentId} path={file.path} hunk={hunk} mode={mode} />
        ))}
      </div>
      {hidden > 0 && (
        <div className="sticky left-0 flex w-full justify-center border-t border-seam bg-inset py-3">
          <Button size="sm" onClick={showAll}>
            Show {plural(hidden, "more line")}
          </Button>
        </div>
      )}
    </section>
  );
}
