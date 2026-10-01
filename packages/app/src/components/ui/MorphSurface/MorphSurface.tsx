import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut, morph } from "@/lib/motion";
import { surface } from "@/lib/styles";
import { blurIn, sharp } from "@/lib/blur";

interface MorphSurfaceProps {
  open: boolean;
  /** Where the surface spreads from its trigger, which it covers while open. */
  side: "top" | "bottom";
  /** Which edge of the trigger the surface stays pinned to; it grows toward the other. */
  align?: "start" | "end";
  /** Sizes the content (its width), which the surface grows to fit. */
  className?: string;
  children: ReactNode;
}

/**
 * A control becoming its own surface. It must sit in a `relative` box that wraps just the trigger: it starts
 * at that box's size and its real width and height grow on `morph` to fit the content, then shrink back on
 * close. The content is laid out at full size and pinned to the corner the surface grows from, so it stays
 * put while the edges uncover it: nothing moves but the surface's edges.
 */
export function MorphSurface({
  open,
  side,
  align = "end",
  className,
  children,
}: MorphSurfaceProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ width: "100%", height: "100%" }}
          animate={{ width: "auto", height: "auto" }}
          exit={{
            width: "100%",
            height: "100%",
            opacity: 0,
            transition: { ...morph, opacity: { duration: 0.14, delay: 0.1 } },
          }}
          transition={morph}
          className={cn(
            surface.overlay,
            "absolute z-40 flex flex-col overflow-clip rounded-2xl",
            align === "end" ? "right-0 items-end" : "left-0 items-start",
            side === "top" ? "bottom-0 justify-end" : "top-0 justify-start",
          )}
        >
          <motion.div
            initial={blurIn}
            animate={{ ...sharp, transition: { ...fadeIn, delay: 0.07 } }}
            exit={{ opacity: 0, transition: fadeOut }}
            className={cn("shrink-0", className)}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
