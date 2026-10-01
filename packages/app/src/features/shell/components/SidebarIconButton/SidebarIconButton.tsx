import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SidebarIconButton({
  label,
  onClick,
  reveal,
  children,
}: {
  label: string;
  onClick?: () => void;
  reveal?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex size-7 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-selected hover:text-ink [&_svg]:size-4",
        reveal && "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
      )}
    >
      {children}
    </button>
  );
}
