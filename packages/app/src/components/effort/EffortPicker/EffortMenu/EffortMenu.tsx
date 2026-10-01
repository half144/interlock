import { useId } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import type { Effort, EffortOption } from "@/types";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut, spring } from "@/lib/motion";
import { blurIn, sharp } from "@/lib/blur";
import { effortCopy } from "@/lib/efforts";
import { Dots } from "@/components/effort/Dots/Dots";
import { useEffortMenu } from "./useEffortMenu";

interface EffortMenuProps {
  value: Effort;
  options: EffortOption[];
  model: string;
  onPick: (effort: Effort) => void;
  onClose: () => void;
}

/**
 * The model's levels as a short list. The highlight follows the pointer or the arrow keys, and the line at the
 * bottom explains whichever level you're on, so the rows never change height under the cursor.
 */
export function EffortMenu({ value, options, model, onPick, onClose }: EffortMenuProps) {
  const id = useId();
  const { active, setActive, list, onKey } = useEffortMenu(value, options, onPick, onClose);
  const { blurb, pace } = effortCopy(active);

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
        {options.map((option, i) => (
          <button
            key={option.id}
            type="button"
            id={`${id}-${option.id}`}
            role="option"
            aria-selected={option.id === value}
            onPointerEnter={() => setActive(option.id)}
            onClick={() => onPick(option.id)}
            tabIndex={-1}
            className="relative flex h-9 w-full cursor-pointer items-center gap-3 px-2.5 text-left text-[13.5px]"
          >
            {option.id === active && (
              <motion.span
                layoutId={`${id}-active`}
                transition={spring}
                className="absolute inset-0 rounded-[10px] bg-selected"
              />
            )}
            <Dots
              filled={i + 1}
              total={options.length}
              className={cn("relative", option.id === active ? "text-ink" : "text-ink-3")}
            />
            <span
              className={cn(
                "relative flex-1 transition-colors duration-150",
                option.id === active ? "text-ink" : "text-ink-2",
              )}
            >
              {option.label}
            </span>
            {option.id === value && (
              <Check className="relative size-3.5 text-ink-2" strokeWidth={2.4} />
            )}
          </button>
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
            <p className="text-[12.5px] leading-[1.45] text-ink-2 [text-wrap:pretty]">{blurb}</p>
            <p className="mt-1 text-[11.5px] text-ink-4">{pace}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
