import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { fadeOut } from "@/lib/motion";
import { LogoMark } from "@/components/ui/LogoMark/LogoMark";

/** "Preview by Interlock", dismissible for the session. */
export function PreviewBadge() {
  const [shown, setShown] = useState(true);
  return (
    <AnimatePresence>
      {shown && (
        <motion.span
          exit={{ opacity: 0, scale: 0.96, transition: fadeOut }}
          style={{ transformOrigin: "bottom right" }}
          className="absolute right-3 bottom-3 z-20 flex items-center gap-2 rounded-full border border-seam-2 bg-ground py-1.5 pr-1.5 pl-3 text-[12.5px] font-medium text-ink shadow-overlay"
        >
          <LogoMark size={14} />
          Preview by Interlock
          <button
            type="button"
            aria-label="Hide badge"
            onClick={() => setShown(false)}
            className="rounded-full p-0.5 text-ink-3 hover:bg-selected hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        </motion.span>
      )}
    </AnimatePresence>
  );
}
