import { cn } from "@/lib/utils";
import { SwapText } from "@/components/ui/SwapText/SwapText";
import type { CardTone } from "@/features/thread/utils/worktreeCard";

const STATUS: Record<CardTone, string> = {
  shimmer: "shimmer",
  hold: "text-hold",
  muted: "text-ink-3",
  green: "text-ink-3",
  merge: "text-ink-3",
};

export function CardLine({
  headline,
  statusText,
  statusTone,
  finished,
  showStatus,
}: {
  headline: string;
  statusText: string;
  statusTone: CardTone;
  finished: boolean;
  showStatus: boolean;
}) {
  return (
    <span className="min-w-0 flex-1">
      <SwapText
        text={headline}
        className={cn(
          "text-[13.5px] transition-colors duration-300",
          finished ? "text-ink-2" : "text-ink",
        )}
      />
      {showStatus && (
        <SwapText text={statusText} className={cn("text-[12px]", STATUS[statusTone])} />
      )}
    </span>
  );
}
