import { AnimatePresence, motion } from "motion/react";
import { fadeIn, fadeOut, spring } from "@/lib/motion";
import { leave } from "../MessageItem/rise";

/**
 * The line keeps its slot under the last reply when it goes, so the reply doesn't drop when the turn ends;
 * the slot folds away once a newer message takes the place under it.
 * Entering, it waits `delay` seconds, so a new reply's name settles first.
 */
export function ThinkingLine({ text, delay = 0 }: { text: string | null; delay?: number }) {
  return (
    <motion.div exit={leave} className="h-6">
      <AnimatePresence>
        {text && (
          <motion.p
            key="thinking"
            initial={{ opacity: 0, y: 4 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { y: { ...spring, delay }, opacity: { ...fadeIn, delay } },
            }}
            exit={{ opacity: 0, transition: fadeOut }}
            className="shimmer w-fit text-[14px] leading-6"
          >
            {text}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
