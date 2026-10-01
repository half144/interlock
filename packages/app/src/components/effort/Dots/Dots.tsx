import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";

export function Dots({
  filled,
  total,
  className,
}: {
  filled: number;
  total: number;
  className?: string;
}) {
  return (
    <span aria-hidden className={cn("flex items-center gap-[3px]", className)}>
      {Array.from({ length: total }, (_, step) => step).map((i) => (
        <motion.span
          key={i}
          initial={false}
          animate={{ opacity: i < filled ? 1 : 0.25, scale: i < filled ? 1 : 0.8 }}
          transition={{ ...spring, delay: i * 0.025 }}
          className="size-[4px] rounded-full bg-current"
        />
      ))}
    </span>
  );
}
