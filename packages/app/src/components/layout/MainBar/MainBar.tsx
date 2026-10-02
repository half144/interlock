import type { CSSProperties, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { dockCss, fadeIn, fadeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { BarPiece, type BarFrame } from "../BarPiece/BarPiece";
import { UsagePill } from "./UsagePill/UsagePill";
import { useMainBar } from "./useMainBar";

/**
 * A view's header: a title or picker on the left, the usage pill on the right. On a Mac it moves up into the
 * window bar. Going compact (the side panel opening) crossfades the right-hand controls instead of swapping
 * them while the column is moving.
 */
export function MainBar({
  left,
  right,
  compact,
  frame,
}: {
  left?: ReactNode;
  right?: ReactNode;
  compact?: boolean;
  frame?: BarFrame | undefined;
}) {
  const { inset } = useMainBar();

  return (
    <BarPiece frame={frame}>
      <header
        data-tauri-drag-region
        style={{ "--bar-inset": `${inset}px` } as CSSProperties}
        className={cn(
          "relative flex h-[52px] shrink-0 items-center gap-2 px-4 transition-[padding]",
          dockCss,
          "mac:h-full mac:min-w-0 mac:flex-1 mac:pl-[max(16px,var(--bar-inset))]",
        )}
      >
        <div data-tauri-drag-region className="flex min-w-0 flex-1 items-center gap-2">
          {left}
        </div>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={compact ? "compact" : "full"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { ...fadeIn, delay: 0.1 } }}
            exit={{ opacity: 0, transition: fadeOut }}
            className="flex shrink-0 items-center gap-2"
          >
            {right}
            {!compact && <UsagePill />}
          </motion.div>
        </AnimatePresence>
      </header>
    </BarPiece>
  );
}
