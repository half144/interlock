import { Box } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut } from "@/lib/motion";
import {
  commandLabel,
  commandSource,
  slashOptionId,
  type SlashCommand,
} from "@/features/thread/utils/slashCommands";
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
      className={cn(
        surface.overlay,
        "absolute inset-x-0 bottom-full z-30 mb-2 max-h-[360px] overflow-y-auto rounded-2xl p-1.5",
      )}
    >
      {items.map((item, i) => (
        <button
          key={item.name}
          id={slashOptionId(i)}
          type="button"
          role="option"
          aria-selected={i === active}
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(item.name);
          }}
          className={cn(
            "flex h-9 w-full items-center gap-3 rounded-lg px-3 text-left transition-colors duration-100",
            i === active ? "bg-selected" : "hover:bg-selected",
          )}
        >
          <Box className="size-4 shrink-0 text-ink-3" aria-hidden />
          <span className="shrink-0 text-[13.5px] text-ink">{commandLabel(item.name)}</span>
          <span className="min-w-0 flex-1 truncate text-[13px] text-ink-3">{item.hint}</span>
          <span className="shrink-0 text-[13px] text-ink-4">{commandSource(item.name)}</span>
        </button>
      ))}
    </motion.div>
  );
}
