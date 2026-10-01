import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RoundButton } from "@/components/ui/RoundButton/RoundButton";
import { cn } from "@/lib/utils";
import { useChipRow } from "./useChipRow";

const fadeBefore =
  "[mask-image:linear-gradient(to_left,black_calc(100%_-_96px),transparent_calc(100%_-_20px))]";
const fadeAfter =
  "[mask-image:linear-gradient(to_right,black_calc(100%_-_96px),transparent_calc(100%_-_20px))]";
const fadeBoth =
  "[mask-image:linear-gradient(to_right,transparent_20px,black_96px,black_calc(100%_-_96px),transparent_calc(100%_-_20px))]";
const scrollButton = "absolute top-3 bg-panel";

/** One line of chips that scrolls sideways; an edge that hides more fades out and gets a round button to page. */
export function ChipRow({ count, children }: { count: number; children: ReactNode }) {
  const { scroller, measure, more, back, forward } = useChipRow(count);

  return (
    <div className="relative pt-3">
      <div
        ref={scroller}
        onScroll={measure}
        className={cn(
          "overflow-x-auto px-1 [scrollbar-width:none]",
          more.before && !more.after && fadeBefore,
          more.after && !more.before && fadeAfter,
          more.before && more.after && fadeBoth,
        )}
      >
        <div className="flex w-max gap-2">{children}</div>
      </div>
      {more.before && (
        <RoundButton
          label="Scroll back"
          variant="outline"
          onClick={back}
          className={cn(scrollButton, "left-0")}
        >
          <ChevronLeft />
        </RoundButton>
      )}
      {more.after && (
        <RoundButton
          label="Scroll for more"
          variant="outline"
          onClick={forward}
          className={cn(scrollButton, "right-0")}
        >
          <ChevronRight />
        </RoundButton>
      )}
    </div>
  );
}
