import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { SwapText } from "@/components/ui/SwapText/SwapText";

export function StepCounter({ text, expanded }: { text: string; expanded: boolean }) {
  return (
    <>
      <span className="shrink-0">
        <SwapText text={text} className="text-right text-[13px] text-ink-3 tabular-nums" />
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
