import type { DiffLine } from "@/types";
import { cn } from "@/lib/utils";
import { CodeText } from "@/components/ui/CodeText/CodeText";
import { lineTone } from "@/features/workspace/utils/diff";
import { CommentButton } from "@/features/workspace/components/diff/CommentButton/CommentButton";

export function UnifiedRow({ line, onComment }: { line: DiffLine; onComment: () => void }) {
  const tone = lineTone[line.kind];
  return (
    <div
      className={cn(
        "group relative grid grid-cols-[44px_44px_18px_1fr] font-mono text-xs leading-5",
        tone.bg,
      )}
    >
      <CommentButton onClick={onComment} />
      <span className="pr-2 text-right text-ink-4 select-none">{line.oldNo ?? ""}</span>
      <span className="pr-2 text-right text-ink-4 select-none">{line.newNo ?? ""}</span>
      <span className={cn("text-center select-none", tone.signClass)}>{tone.sign}</span>
      <span className={cn("pr-6 whitespace-pre", tone.text)}>
        <CodeText text={line.text} />
      </span>
    </div>
  );
}
