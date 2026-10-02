import { Box } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  commandLabel,
  commandSource,
  slashOptionId,
  type SlashCommand,
} from "@/features/thread/utils/slashCommands";

interface SlashMenuItemProps {
  command: SlashCommand;
  index: number;
  active: boolean;
  onPick: (name: string) => void;
  onHover: (index: number) => void;
}

export function SlashMenuItem({ command, index, active, onPick, onHover }: SlashMenuItemProps) {
  return (
    <button
      id={slashOptionId(index)}
      type="button"
      role="option"
      aria-selected={active}
      onMouseMove={() => !active && onHover(index)}
      onMouseDown={(e) => {
        e.preventDefault();
        onPick(command.name);
      }}
      className={cn(
        "flex h-7 w-full items-center gap-2.5 rounded-md px-2.5 text-left transition-colors duration-100",
        active && "bg-selected",
      )}
    >
      <Box className="size-3.5 shrink-0 text-ink-3" strokeWidth={1.5} aria-hidden />
      <span className="shrink-0 text-[12.5px] text-ink">{commandLabel(command.name)}</span>
      <span className="min-w-0 flex-1 truncate text-[12px] text-ink-3">{command.hint}</span>
      <span className="shrink-0 text-[12px] text-ink-4">{commandSource(command.name)}</span>
    </button>
  );
}
