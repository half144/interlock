import { useId } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import type { Access } from "@/types";
import type { AccessOption } from "@/lib/access";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut, spring } from "@/lib/motion";
import { blurIn, sharp } from "@/lib/blur";
import { useListbox } from "@/hooks/useListbox";
import { ACCESS_ICONS } from "../icons";

interface AccessMenuProps {
  value: Access;
  options: AccessOption[];
  onPick: (access: Access) => void;
  onClose: () => void;
}

/** The levels as a short list; the line under it explains whichever one you're on, so rows never change height under the cursor. */
export function AccessMenu({ value, options, onPick, onClose }: AccessMenuProps) {
  const id = useId();
  const { active, setActive, list, onKey } = useListbox(
    value,
    options,
    (picked) => onPick(picked as Access),
    onClose,
  );
  const blurb = options.find((o) => o.id === active)?.blurb;

  return (
    <div className="p-1.5">
      <div
        ref={list}
        role="listbox"
        tabIndex={-1}
        aria-label="Access"
        aria-activedescendant={`${id}-${active}`}
        onKeyDown={onKey}
        className="outline-none"
      >
        {options.map((option) => {
          const Icon = ACCESS_ICONS[option.id];
          const dangerous = option.id === "full-auto";
          return (
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
              <Icon
                className={cn(
                  "relative size-3.5",
                  dangerous && "text-red",
                  !dangerous && (option.id === active ? "text-ink" : "text-ink-3"),
                )}
              />
              <span
                className={cn(
                  "relative flex-1 transition-colors duration-150",
                  dangerous && "text-red",
                  !dangerous && (option.id === active ? "text-ink" : "text-ink-2"),
                )}
              >
                {option.label}
              </span>
              {option.id === value && (
                <Check className="relative size-3.5 text-ink-2" strokeWidth={2.4} />
              )}
            </button>
          );
        })}
      </div>

      <div className="mx-2.5 mt-1.5 grid min-h-[52px] border-t border-seam pt-2.5 pb-1.5">
        <AnimatePresence initial={false}>
          <motion.p
            key={active}
            initial={blurIn}
            animate={sharp}
            exit={{ ...blurIn, transition: fadeOut }}
            transition={fadeIn}
            className="text-[12.5px] leading-[1.45] text-ink-2 [grid-area:1/1] [text-wrap:pretty]"
          >
            {blurb}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
