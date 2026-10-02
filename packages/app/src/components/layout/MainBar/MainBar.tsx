import type { ReactNode } from "react";
import { PanelLeft } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import { dockCss, fadeIn, fadeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { UsagePill } from "./UsagePill/UsagePill";
import { useMainBar } from "./useMainBar";

/**
 * Top of the main area: a title or picker on the left, the usage pill on the right. Going compact (the side
 * panel opening) crossfades the right-hand controls instead of swapping them while the column is moving.
 */
export function MainBar({
  left,
  right,
  compact,
}: {
  left?: ReactNode;
  right?: ReactNode;
  compact?: boolean;
}) {
  const { overhang, expand } = useMainBar();

  return (
    <header
      data-tauri-drag-region
      className={cn(
        "relative flex h-[52px] shrink-0 items-center gap-2 px-4 transition-[padding]",
        dockCss,
        overhang && "mac:pl-[calc(var(--spacing-lights)-52px+16px)]",
      )}
    >
      <div data-tauri-drag-region className="flex min-w-0 flex-1 items-center gap-2">
        {overhang && (
          <IconButton label="Expand sidebar" onClick={expand} className="hidden mac:inline-flex">
            <PanelLeft />
          </IconButton>
        )}
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
  );
}
