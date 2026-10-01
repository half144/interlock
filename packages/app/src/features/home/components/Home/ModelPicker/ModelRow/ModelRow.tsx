import { motion } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import type { ModelEntry } from "@/features/home/utils/modelGroups";

interface ModelRowProps {
  id: string;
  entry: ModelEntry;
  selected: "base" | "wide" | null;
  active: boolean;
  highlightId: string;
  onHover: () => void;
  onPick: (modelId: string) => void;
}

export function ModelRow({
  id,
  entry,
  selected,
  active,
  highlightId,
  onHover,
  onPick,
}: ModelRowProps) {
  const { wideId } = entry;
  return (
    <div
      onPointerEnter={onHover}
      className="relative flex h-9 w-full items-center gap-2 px-2.5 text-[13.5px]"
    >
      {active && (
        <motion.span
          layoutId={highlightId}
          transition={spring}
          className="absolute inset-0 rounded-[10px] bg-selected"
        />
      )}
      <button
        type="button"
        id={id}
        role="option"
        aria-selected={selected !== null}
        tabIndex={-1}
        onClick={() => onPick(entry.id)}
        className={cn(
          "relative h-full flex-1 truncate text-left",
          active || selected ? "text-ink" : "text-ink-2",
        )}
      >
        {entry.label}
      </button>
      {wideId && (
        <button
          type="button"
          tabIndex={-1}
          aria-label={`${entry.label} with 1M context`}
          aria-pressed={selected === "wide"}
          onClick={() => onPick(wideId)}
          className={cn(
            "relative rounded-md px-1.5 py-0.5 text-[11px] leading-none transition-colors duration-150",
            selected === "wide"
              ? "bg-white/[0.12] text-ink"
              : "bg-white/[0.05] text-ink-3 hover:text-ink-2",
          )}
        >
          1M
        </button>
      )}
      {selected && <Check className="relative size-3.5 text-ink-2" strokeWidth={2.4} />}
    </div>
  );
}
