import { cn } from "@/lib/utils";
import { Kbd } from "@/components/ui/Kbd/Kbd";
import { Lamp } from "@/components/ui/Lamp/Lamp";
import type { PaletteItem } from "@/features/palette/types";

interface PaletteRowProps {
  item: PaletteItem;
  active: boolean;
  onHover: () => void;
  onRun: () => void;
}

export function PaletteRow({ item, active, onHover, onRun }: PaletteRowProps) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      role="option"
      id={`palette-${item.id}`}
      aria-selected={active}
      onMouseMove={onHover}
      onClick={onRun}
      className={cn(
        "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left transition-colors duration-75",
        active ? "bg-selected" : "bg-transparent",
      )}
    >
      <span className="flex w-4 shrink-0 justify-center text-ink-3 [&_svg]:size-4">
        {item.agent ? (
          <Lamp aspect={item.agent.aspect} progress={item.agent.progress} />
        ) : (
          Icon && <Icon />
        )}
      </span>
      <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">{item.title}</span>
      {item.hint && <span className="shrink-0 truncate text-[12.5px] text-ink-3">{item.hint}</span>}
      {item.keys && (
        <span className="flex shrink-0 gap-0.5">
          {item.keys.map((k) => (
            <Kbd key={k}>{k}</Kbd>
          ))}
        </span>
      )}
    </button>
  );
}
