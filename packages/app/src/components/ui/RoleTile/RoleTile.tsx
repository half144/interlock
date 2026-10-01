import type { SubagentRole } from "@/types";
import { cn } from "@/lib/utils";
import { roleIcon } from "@/lib/roleIcon";

export function RoleTile({
  role,
  size = "md",
  className,
}: {
  role: SubagentRole;
  size?: "sm" | "md";
  className?: string;
}) {
  const Icon = roleIcon[role];
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg bg-inset text-ink-2",
        size === "sm" ? "size-6 rounded-full border-2 border-raised" : "size-8",
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3" : "size-4"} />
    </span>
  );
}
