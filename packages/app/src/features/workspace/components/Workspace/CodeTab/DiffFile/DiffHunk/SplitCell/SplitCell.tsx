import type { DiffLine } from "@/types";
import { cn } from "@/lib/utils";
import { CodeText } from "@/components/ui/CodeText/CodeText";
import { lineTone } from "@/features/workspace/utils/diff";
import { CommentButton } from "@/features/workspace/components/diff/CommentButton/CommentButton";

export function SplitCell({
  line,
  side,
  onComment,
}: {
  line?: DiffLine | undefined;
  side: "old" | "new";
  onComment?: (() => void) | undefined;
}) {
  if (!line) return <div className="bg-inset/60" />;
  const tone = lineTone[line.kind];
  const number = side === "old" ? line.oldNo : line.newNo;
  return (
    <div
      className={cn(
        "group relative grid min-w-0 grid-cols-[40px_16px_1fr] font-mono text-xs leading-5",
        tone.bg,
      )}
    >
      {onComment && <CommentButton onClick={onComment} />}
      <span className="pr-2 text-right text-ink-4 select-none">{number ?? ""}</span>
      <span className={cn("text-center select-none", tone.signClass)}>{tone.sign}</span>
      <span className={cn("overflow-hidden pr-3 text-ellipsis whitespace-pre", tone.text)}>
        <CodeText text={line.text} />
      </span>
    </div>
  );
}
