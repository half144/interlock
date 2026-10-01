import { cn } from "@/lib/utils";

/** The little screen poking out of the card; opens the worktree. */
export function WorktreeScreen({
  label,
  finished,
  onOpen,
}: {
  label: string;
  finished: boolean;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={label}
      title="Open worktree"
      className="absolute -top-3 left-3 z-10 flex h-11 w-16 flex-col justify-center gap-[3px] overflow-hidden rounded-lg border border-seam-2 bg-[#22211f] px-2 shadow-card transition-[translate,scale] duration-150 ease-out-quint hover:-translate-y-0.5 active:scale-95"
    >
      {[70, 45, 85, 30].map((w, i) => (
        <span
          key={w}
          className={cn(
            "h-[3px] rounded-full transition-colors duration-500",
            i === 1 && !finished ? "bg-[#7ee787]/70" : "bg-white/35",
          )}
          style={{ width: `${w}%` }}
        />
      ))}
    </button>
  );
}
