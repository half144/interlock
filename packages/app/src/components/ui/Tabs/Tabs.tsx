import { useId } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import { segment } from "@/lib/styles";

interface TabsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  items: { value: T; label: string }[];
  className?: string;
}

/** Segmented tabs. The selected background slides to the new tab instead of blinking between them. */
export function Tabs<T extends string>({ value, onChange, items, className }: TabsProps<T>) {
  const group = useId();
  return (
    <div
      role="tablist"
      className={cn("inline-flex h-7 items-center gap-0.5 rounded-md bg-hover p-0.5", className)}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "relative inline-flex h-full items-center rounded-[5px] px-2.5 text-[12.5px] font-medium transition-colors duration-150",
              active ? "text-ink" : "text-ink-3 hover:text-ink-2",
            )}
          >
            {active && (
              <motion.span
                layoutId={`${group}-tab`}
                transition={spring}
                className={cn("absolute inset-0 rounded-[5px]", segment)}
              />
            )}
            <span className="relative">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
