import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

export function Toggle({ checked, onChange, label, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-[18px] w-8 shrink-0 items-center rounded-full border transition-colors duration-200",
        checked ? "border-transparent bg-ink" : "border-seam-2 bg-selected",
        className,
      )}
    >
      <motion.span
        initial={false}
        animate={{ x: checked ? 13 : 0 }}
        transition={spring}
        className={cn(
          "absolute left-[2px] size-3 rounded-full transition-colors duration-200",
          checked ? "bg-ground" : "bg-ink-3",
        )}
      />
    </button>
  );
}
