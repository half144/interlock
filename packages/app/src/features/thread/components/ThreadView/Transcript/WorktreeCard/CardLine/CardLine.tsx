import { cn } from "@/lib/utils";
import { SwapText } from "@/components/ui/SwapText/SwapText";
import type { CardStatus } from "@/features/thread/utils/worktreeCard";

const STATUS: Record<CardStatus["tone"], string> = { shimmer: "shimmer", hold: "text-hold" };

export function CardLine({
  headline,
  status,
  finished,
}: {
  headline: string;
  status: CardStatus | null;
  finished: boolean;
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
      {status && <SwapText text={status.text} className={cn("text-[12px]", STATUS[status.tone])} />}
    </span>
  );
}
