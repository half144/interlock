import { cn } from "@/lib/utils";

/** Lines added and removed, as `+214 −97`, in the diff colours. */
export function DiffStat({
  additions,
  deletions,
  className,
}: {
  additions: number;
  deletions: number;
  className?: string;
}) {
  return (
    <span className={cn("font-mono tabular-nums", className)}>
      <span className="text-add">+{additions}</span> <span className="text-del">−{deletions}</span>
    </span>
  );
}
