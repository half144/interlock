import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut } from "@/lib/motion";
import type { SlashCommand } from "@/features/thread/utils/slashCommands";
import { surface } from "@/lib/styles";
import { SlashMenuItem } from "./SlashMenuItem/SlashMenuItem";

interface SlashMenuProps {
  items: SlashCommand[];
  active: number;
  onPick: (name: string) => void;
}

export function SlashMenu({ items, active, onPick }: SlashMenuProps) {
  return (
    <motion.div
      role="listbox"
      aria-label="Commands"
      initial={{ opacity: 0, y: 4, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: fadeIn }}
      exit={{ opacity: 0, y: 2, transition: fadeOut }}
      style={{ transformOrigin: "bottom left" }}
      className={cn(
        surface.overlay,
        "absolute inset-x-0 bottom-full z-30 mb-2 max-h-[360px] overflow-y-auto rounded-2xl p-1.5",
      )}
    >
      {items.map((item, i) => (
        <SlashMenuItem
          key={item.name}
          command={item}
          index={i}
          active={i === active}
          onPick={onPick}
        />
      ))}
    </motion.div>
  );
}
