import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut } from "@/lib/motion";
import type { SlashCommand } from "@/features/thread/utils/slashCommands";
import { surface } from "@/lib/styles";

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
      className={cn(surface.overlay, "absolute bottom-full left-0 z-30 mb-2 w-96 rounded-lg p-1")}
    >
      {items.map((item, i) => (
        <button
          key={item.name}
          type="button"
          role="option"
          aria-selected={i === active}
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(item.name);
          }}
          className={cn(
            "flex h-8 w-full items-center gap-3 rounded-[5px] px-2 text-left transition-colors duration-100",
            i === active ? "bg-selected" : "hover:bg-selected",
          )}
        >
          <span className="w-32 shrink-0 truncate font-mono text-[12px] text-ink">{item.name}</span>
          <span className="truncate text-[12.5px] text-ink-3">{item.hint}</span>
        </button>
      ))}
    </motion.div>
  );
}
