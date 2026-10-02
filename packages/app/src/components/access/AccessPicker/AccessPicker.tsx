import { AnimatePresence, motion } from "motion/react";
import type { Access } from "@/types";
import type { AccessOption } from "@/lib/access";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut, morph } from "@/lib/motion";
import { blurIn, sharp } from "@/lib/blur";
import { useMorphMenu } from "@/hooks/useMorphMenu";
import { MorphSurface } from "@/components/ui/MorphSurface/MorphSurface";
import { AccessMenu } from "./AccessMenu/AccessMenu";
import { ACCESS_ICONS } from "./icons";

// The menu's rows and the description block under them.
const ROW_HEIGHT = 36;
const MENU_CHROME = 100;

interface AccessPickerProps {
  value: Access;
  options: AccessOption[];
  onChange: (access: Access) => void;
}

/** How far the agent may go before it stops to ask, set per conversation next to the effort pill. Only Full access carries colour. */
export function AccessPicker({ value, options, onChange }: AccessPickerProps) {
  const { open, side, root, trigger, show, close } = useMorphMenu(
    options.length * ROW_HEIGHT + MENU_CHROME,
  );
  const current = options.find((o) => o.id === value);
  if (!current) return null;
  const Icon = ACCESS_ICONS[value];

  return (
    <div ref={root} className="relative">
      <motion.button
        ref={trigger}
        layout
        type="button"
        onClick={show}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Access: ${current.label}`}
        title="Access"
        transition={morph}
        style={{ borderRadius: 16 }}
        className={cn(
          "relative inline-flex h-8 items-center bg-white/[0.06] px-3 text-[13px] transition-colors duration-150 hover:text-ink",
          value === "full-auto" ? "text-red" : "text-ink-2",
        )}
      >
        <motion.span layout="position" className="relative flex items-center gap-2">
          <Icon className="size-3.5" />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={value}
              initial={blurIn}
              animate={{ ...sharp, transition: { ...fadeIn, delay: 0.12 } }}
              exit={{ ...blurIn, transition: fadeOut }}
            >
              {current.label}
            </motion.span>
          </AnimatePresence>
        </motion.span>
      </motion.button>

      <MorphSurface open={open} side={side} align="start" className="w-[262px]">
        <AccessMenu
          value={value}
          options={options}
          onPick={(access) => {
            onChange(access);
            close();
          }}
          onClose={close}
        />
      </MorphSurface>
    </div>
  );
}
