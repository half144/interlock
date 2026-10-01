import { useId } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import { PANES, type Pane } from "@/features/workspace/utils/terminal";

export function TerminalPanes({ pane, onChange }: { pane: Pane; onChange: (pane: Pane) => void }) {
  const group = useId();
  return (
    <>
      {PANES.map(([value, label]) => (
        <button
          key={value}
          type="button"
          aria-pressed={pane === value}
          onClick={() => onChange(value)}
          className={cn(
            "relative h-full shrink-0 px-2.5 font-mono text-[11px] whitespace-nowrap transition-colors duration-150",
            pane === value ? "text-ink" : "text-ink-3 hover:text-ink-2",
          )}
        >
          {label}
          {pane === value && (
            <motion.span
              layoutId={`${group}-pane`}
              transition={spring}
              className="absolute inset-x-2 bottom-0 h-px bg-ink"
            />
          )}
        </button>
      ))}
    </>
  );
}
