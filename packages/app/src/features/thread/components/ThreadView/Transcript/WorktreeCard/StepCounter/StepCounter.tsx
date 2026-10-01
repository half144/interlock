import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { SwapText } from "@/components/ui/SwapText/SwapText";
import type { CardTone } from "@/features/thread/utils/worktreeCard";

const TONE: Record<CardTone, string> = {
  muted: "text-[13px] text-ink-3",
  green: "text-[12.5px] text-green",
  merge: "text-[12.5px] text-merge",
  hold: "text-[13px] text-hold",
  shimmer: "text-[13px] text-ink-3",
};

export function StepCounter({
  text,
  tone,
  expanded,
}: {
  text: string;
  tone: CardTone;
  expanded: boolean;
}) {
  return (
    <>
      <span className="shrink-0">
        <SwapText text={text} className={cn("text-right tabular-nums", TONE[tone])} />
      </span>
      <ChevronUp
        className={cn(
          "size-4 shrink-0 text-ink-3 transition-transform duration-200 ease-out-quint",
          expanded && "rotate-180",
        )}
      />
    </>
  );
}
