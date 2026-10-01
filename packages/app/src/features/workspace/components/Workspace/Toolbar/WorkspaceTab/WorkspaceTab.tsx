import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import type { PanelTab } from "@/types";
import { cn } from "@/lib/utils";
import { fadeIn, spring } from "@/lib/motion";

interface WorkspaceTabProps {
  value: PanelTab;
  label: string;
  icon: LucideIcon;
  active: PanelTab;
  count?: number | undefined;
  onSelect: (tab: PanelTab) => void;
}

/** An icon tab that widens to show its label when active; the selection pill slides between tabs. */
export function WorkspaceTab({
  value,
  label,
  icon: Icon,
  active,
  count,
  onSelect,
}: WorkspaceTabProps) {
  const selected = active === value;
  return (
    <motion.button
      layout="position"
      layoutDependency={active}
      transition={spring}
      type="button"
      role="tab"
      aria-selected={selected}
      aria-label={label}
      title={label}
      onClick={() => onSelect(value)}
      className={cn(
        "relative isolate inline-flex h-8 items-center gap-1.5 rounded-lg text-[13.5px] transition-colors duration-150",
        selected
          ? "px-2.5 font-medium text-ink"
          : "w-8 justify-center text-ink-2 hover:bg-hover hover:text-ink",
      )}
    >
      {selected && (
        <motion.span
          layoutId="tab"
          layoutDependency={active}
          transition={spring}
          style={{ borderRadius: 8 }}
          className="absolute inset-0 -z-10 bg-selected"
        />
      )}
      <Icon className="size-4" />
      {selected && (
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={fadeIn}>
          {label}
        </motion.span>
      )}
      {count !== undefined &&
        count > 0 &&
        (selected ? (
          <span className="tabular-nums text-ink-3">{count}</span>
        ) : (
          <span className="sr-only">{count}</span>
        ))}
    </motion.button>
  );
}
