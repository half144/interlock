import { useId } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import type { DiffMode } from "@/features/workspace/utils/diff";

const MODES: DiffMode[] = ["unified", "split"];

export function DiffModeSwitch({
  mode,
  onChange,
}: {
  mode: DiffMode;
  onChange: (mode: DiffMode) => void;
}) {
  const group = useId();
  return (
    <span className="flex items-center gap-0.5 text-[12.5px]">
      {MODES.map((v) => (
        <button
          key={v}
          type="button"
          aria-pressed={mode === v}
          onClick={() => onChange(v)}
          className={cn(
            "relative isolate rounded-md px-1.5 py-0.5 capitalize transition-colors duration-150",
            mode === v ? "text-ink" : "text-ink-3 hover:text-ink-2",
          )}
        >
          {mode === v && (
            <motion.span
              layoutId={`${group}-mode`}
              transition={spring}
              style={{ borderRadius: 6 }}
              className="absolute inset-0 -z-10 bg-selected"
            />
          )}
          {v}
        </button>
      ))}
    </span>
  );
}
