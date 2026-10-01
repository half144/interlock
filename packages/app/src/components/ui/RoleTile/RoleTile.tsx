import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export function RoleTile({ size = "md", className }: { size?: "sm" | "md"; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg bg-inset text-ink-2",
        size === "sm" ? "size-6 rounded-full border-2 border-raised" : "size-8",
        className,
      )}
    >
      <Bot className={size === "sm" ? "size-3" : "size-4"} />
    </span>
  );
}
