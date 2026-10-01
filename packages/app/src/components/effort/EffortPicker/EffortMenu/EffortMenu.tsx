import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import type { Effort } from "@/types";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut, spring } from "@/lib/motion";
import { blurIn, sharp } from "@/lib/blur";
import { LEVELS, efforts } from "@/lib/efforts";
import { Dots } from "@/components/effort/Dots/Dots";

interface EffortMenuProps {
  value: Effort;
  model: string;
  onPick: (effort: Effort) => void;
  onClose: () => void;
}

/**
 * The four levels as a short list. The highlight follows the pointer or the arrow keys, and the line at the
 * bottom explains whichever level you're on, so the rows never change height under the cursor.
 */
export function EffortMenu({ value, model, onPick, onClose }: EffortMenuProps) {
  const [active, setActive] = useState(value);
  const id = useId();
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => list.current?.focus(), []);

  const move = (to: number) => {
    const level = LEVELS[Math.min(LEVELS.length - 1, Math.max(0, to))];
    if (level) setActive(level);
  };

  const onKey = (e: KeyboardEvent) => {
    const at = LEVELS.indexOf(active);
    if (e.key === "ArrowDown") move(at + 1);
    else if (e.key === "ArrowUp") move(at - 1);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(LEVELS.length - 1);
    else if (e.key === "Enter" || e.key === " ") onPick(active);
    else if (e.key === "Escape" || e.key === "Tab") onClose();
    else return;
    e.preventDefault();
  };

  return (
    <motion.div
      layout
      initial={blurIn}
      animate={{ ...sharp, transition: { ...fadeIn, delay: 0.07 } }}
      exit={{ opacity: 0, transition: fadeOut }}
      className="p-1.5"
    >
      <p className="flex items-baseline justify-between gap-3 px-2.5 pt-1.5 pb-2 text-[12px]">
        <span className="text-ink-2">Reasoning</span>
        <span className="truncate text-ink-4">{model}</span>
      </p>

      <div
        ref={list}
        role="listbox"
        tabIndex={-1}
        aria-label="Reasoning effort"
        aria-activedescendant={`${id}-${active}`}
        onKeyDown={onKey}
        className="outline-none"
      >
        {LEVELS.map((level) => (
          <div
            key={level}
            id={`${id}-${level}`}
            role="option"
            aria-selected={level === value}
            onPointerEnter={() => setActive(level)}
            onClick={() => onPick(level)}
            className="relative flex h-9 cursor-pointer items-center gap-3 px-2.5 text-[13.5px]"
          >
            {level === active && (
              <motion.span
                layoutId={`${id}-active`}
                transition={spring}
                className="absolute inset-0 rounded-[10px] bg-selected"
              />
            )}
            <Dots
              level={level}
              className={cn("relative", level === active ? "text-ink" : "text-ink-3")}
            />
            <span
              className={cn(
                "relative flex-1 transition-colors duration-150",
                level === active ? "text-ink" : "text-ink-2",
              )}
            >
              {efforts[level].label}
            </span>
            {level === value && (
              <Check className="relative size-3.5 text-ink-2" strokeWidth={2.4} />
            )}
          </div>
        ))}
      </div>

      <div className="mx-2.5 mt-1.5 grid min-h-[58px] border-t border-seam pt-2.5 pb-1.5">
        <AnimatePresence initial={false}>
          <motion.div
            key={active}
            initial={blurIn}
            animate={sharp}
            exit={{ ...blurIn, transition: fadeOut }}
            transition={fadeIn}
            className="[grid-area:1/1]"
          >
            <p className="text-[12.5px] leading-[1.45] text-ink-2 [text-wrap:pretty]">
              {efforts[active].blurb}
            </p>
            <p className="mt-1 text-[11.5px] text-ink-4">{efforts[active].pace}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
