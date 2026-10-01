import { useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Effort } from "@/types";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut, morph } from "@/lib/motion";
import { surface } from "@/lib/styles";
import { useClickOutside } from "@/hooks/useClickOutside";
import { blurIn, sharp } from "@/lib/blur";
import { efforts } from "@/lib/efforts";
import { Dots } from "../Dots/Dots";
import { EffortMenu } from "./EffortMenu/EffortMenu";

interface EffortPickerProps {
  value: Effort;
  onChange: (effort: Effort) => void;
  model: string;
}

/**
 * How hard the agent thinks, set per message next to Send. The pill doesn't open a menu so much as become
 * one: its shape stretches up into the list, and folds back into the pill with the new level once you pick.
 */
export function EffortPicker({ value, onChange, model }: EffortPickerProps) {
  const [open, setOpen] = useState(false);
  const shape = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useClickOutside(root, () => setOpen(false), open);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };

  return (
    <div ref={root} className="relative">
      <motion.button
        ref={trigger}
        layout
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Reasoning effort: ${efforts[value].label}`}
        title="Reasoning effort"
        transition={morph}
        className="relative inline-flex h-8 items-center px-3 text-[13px] text-ink-2 transition-colors duration-150 hover:text-ink"
      >
        {!open && (
          <motion.span
            layoutId={shape}
            transition={morph}
            className="absolute inset-0 bg-white/[0.06]"
            style={{ borderRadius: 16 }}
          />
        )}
        <motion.span layout="position" className="relative flex items-center gap-2">
          <Dots level={value} />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              initial={blurIn}
              animate={{ ...sharp, transition: { ...fadeIn, delay: 0.12 } }}
              exit={{ ...blurIn, transition: fadeOut }}
            >
              {efforts[value].label}
            </motion.span>
          </AnimatePresence>
        </motion.span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            layoutId={shape}
            transition={morph}
            exit={{ opacity: 0, transition: { duration: 0.14 } }}
            style={{ borderRadius: 16 }}
            className={cn(
              surface.overlay,
              "absolute right-0 bottom-0 z-40 w-[264px] overflow-hidden",
            )}
          >
            <EffortMenu
              value={value}
              model={model}
              onPick={(effort) => {
                onChange(effort);
                close();
              }}
              onClose={close}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
