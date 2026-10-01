import type { ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { foldTransition } from "@/features/shell/utils/fold";

interface NavItemProps {
  collapsed: boolean;
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
}

/** A sidebar destination; folded to the rail, only its icon shows and the label becomes a tooltip. */
export function NavItem({ collapsed, active, onClick, icon, label }: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      title={collapsed ? label : undefined}
      className={cn(
        "flex h-9 w-full items-center gap-2.5 overflow-hidden rounded-lg px-2.5 text-[14px] text-ink transition-colors duration-150 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-ink-2",
        active ? "bg-selected" : "hover:bg-hover",
      )}
    >
      {icon}
      <motion.span
        initial={false}
        animate={{ opacity: collapsed ? 0 : 1 }}
        transition={foldTransition(!collapsed)}
        className="whitespace-nowrap"
      >
        {label}
      </motion.span>
    </button>
  );
}
