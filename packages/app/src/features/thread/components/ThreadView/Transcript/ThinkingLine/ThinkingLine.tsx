import { AnimatePresence, motion } from "motion/react";
import { fadeIn, fadeOut, spring } from "@/lib/motion";

/** The reply's blocks sit 12px apart; leaving, the line takes that gap with it so the reply doesn't jump. */
const GAP = 12;

export function ThinkingLine({ text }: { text: string | null }) {
  return (
    <AnimatePresence initial={false}>
      {text && (
        <motion.p
          key="thinking"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0, transition: { y: spring, opacity: fadeIn } }}
          exit={{
            opacity: 0,
            height: 0,
            marginTop: -GAP,
            transition: { opacity: fadeOut, height: spring, marginTop: spring },
          }}
          className="shimmer w-fit text-[14px] leading-6"
        >
          {text}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
