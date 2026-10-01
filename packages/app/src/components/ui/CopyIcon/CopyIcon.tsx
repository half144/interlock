import { AnimatePresence, motion } from "motion/react";
import { Check, Copy } from "lucide-react";
import { fadeOut, spring } from "@/lib/motion";

/** The copy glyph, swapped for a green check for a moment after copying. */
export function CopyIcon({ copied }: { copied: boolean }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={copied ? "done" : "copy"}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1, transition: spring }}
        exit={{ opacity: 0, scale: 0.6, transition: fadeOut }}
        className="inline-flex"
      >
        {copied ? <Check className="text-green" /> : <Copy />}
      </motion.span>
    </AnimatePresence>
  );
}
