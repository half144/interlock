import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut, morph } from "@/lib/motion";
import { surface } from "@/lib/styles";
import { blurIn, sharp } from "@/lib/blur";

interface MorphSurfaceProps {
  /** The `MorphShape` id this surface grows out of. */
  id: string;
  open: boolean;
  /** Where the surface spreads from its trigger, which it covers while open. */
  side: "top" | "bottom";
  className?: string;
  children: ReactNode;
}

/**
 * A control becoming its own surface: the trigger's shape stretches into an overlay on `morph`, the content
 * comes into focus once the shape has mostly landed, and on close the shape folds back into the trigger.
 */
export function MorphSurface({ id, open, side, className, children }: MorphSurfaceProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          layoutId={id}
          transition={morph}
          exit={{ opacity: 0, transition: { duration: 0.14 } }}
          style={{ borderRadius: 16 }}
          className={cn(
            surface.overlay,
            "absolute right-0 z-40 overflow-hidden",
            side === "top" ? "bottom-0" : "top-0",
            className,
          )}
        >
          {/* `layout` keeps the content from stretching with the shape's scale while it morphs. */}
          <motion.div
            layout
            initial={blurIn}
            animate={{ ...sharp, transition: { ...fadeIn, delay: 0.07 } }}
            exit={{ opacity: 0, transition: fadeOut }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
