import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  children: ReactNode;
  onSelect: () => void;
  active?: boolean;
  hint?: ReactNode;
}

/** One row of a Popover menu: icon, label and an optional right-aligned hint or check. */
export function MenuItem({ children, onSelect, active, hint }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onSelect}
      className={cn(
        "flex h-8 w-full items-center gap-2 rounded-[5px] px-2 text-left text-[13px] transition-colors duration-100 [&_svg]:size-3.5 [&_svg]:text-ink-3",
        active ? "bg-selected text-ink" : "text-ink-2 hover:bg-selected hover:text-ink",
      )}
    >
      {children}
      {hint && <span className="ml-auto pl-4 text-xs text-ink-3">{hint}</span>}
    </button>
  );
}
