import { cn } from "@/lib/utils";

export function Kbd({ children, className }: { children: string; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-[4px] border border-seam bg-hover px-1 font-sans text-[11px] leading-none font-medium text-ink-3",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
