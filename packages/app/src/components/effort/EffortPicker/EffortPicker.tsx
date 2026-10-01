import { AnimatePresence, motion } from "motion/react";
import type { Effort, EffortOption } from "@/types";
import { fadeIn, fadeOut, morph } from "@/lib/motion";
import { blurIn, sharp } from "@/lib/blur";
import { MorphSurface } from "@/components/ui/MorphSurface/MorphSurface";
import { Dots } from "../Dots/Dots";
import { EffortMenu } from "./EffortMenu/EffortMenu";
import { useEffortPicker } from "./useEffortPicker";

interface EffortPickerProps {
  value: Effort;
  options: EffortOption[];
  onChange: (effort: Effort) => void;
  model: string;
}

/**
 * How hard the agent thinks, set per message next to Send. The pill doesn't open a menu so much as become
 * one: its shape stretches into the list (up, or down when the list would not fit above), and folds back
 * into the pill with the new level once you pick.
 * The levels are the ones the model offers; a model with none gets no pill.
 */
export function EffortPicker({ value, options, onChange, model }: EffortPickerProps) {
  const { open, side, root, trigger, show, close } = useEffortPicker(options.length);
  if (options.length === 0) return null;

  const at = options.findIndex((o) => o.id === value);
  const label = options[at]?.label ?? value;

  return (
    <div ref={root} className="relative">
      <motion.button
        ref={trigger}
        layout
        type="button"
        onClick={show}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Reasoning effort: ${label}`}
        title="Reasoning effort"
        transition={morph}
        style={{ borderRadius: 16 }}
        className="relative inline-flex h-8 items-center bg-white/[0.06] px-3 text-[13px] text-ink-2 transition-colors duration-150 hover:text-ink"
      >
        <motion.span layout="position" className="relative flex items-center gap-2">
          <Dots filled={at + 1} total={options.length} />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              initial={blurIn}
              animate={{ ...sharp, transition: { ...fadeIn, delay: 0.12 } }}
              exit={{ ...blurIn, transition: fadeOut }}
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </motion.span>
      </motion.button>

      <MorphSurface open={open} side={side} className="w-[262px]">
        <EffortMenu
          value={value}
          options={options}
          model={model}
          onPick={(effort) => {
            onChange(effort);
            close();
          }}
          onClose={close}
        />
      </MorphSurface>
    </div>
  );
}
