import { useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut } from "@/lib/motion";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useEscape } from "@/hooks/useEscape";
import { surface } from "@/lib/styles";

interface PopoverProps {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: (close: () => void) => ReactNode;
  side?: "top" | "bottom";
  align?: "start" | "end";
  className?: string;
}

/** Anchored menu that grows out of its trigger, and closes on outside click and Escape. */
export function Popover({
  trigger,
  children,
  side = "bottom",
  align = "start",
  className,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => setOpen(false), open);
  useEscape(() => setOpen(false), open);

  return (
    <div ref={ref} className="relative min-w-0">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.96, y: side === "top" ? 4 : -4 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: fadeIn }}
            exit={{ opacity: 0, scale: 0.98, transition: fadeOut }}
            style={{
              transformOrigin: `${side === "top" ? "bottom" : "top"} ${align === "end" ? "right" : "left"}`,
            }}
            className={cn(
              "absolute z-40 min-w-48 rounded-lg p-1",
              surface.overlay,
              side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
              align === "end" ? "right-0" : "left-0",
              className,
            )}
          >
            {children(() => setOpen(false))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
