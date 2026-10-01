import { cn } from "@/lib/utils";

interface PlanFirstToggleProps {
  pressed: boolean;
  disabledReason?: string;
  onToggle: () => void;
}

export function PlanFirstToggle({ pressed, disabledReason, onToggle }: PlanFirstToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={pressed}
      disabled={disabledReason !== undefined}
      title={disabledReason ?? "The agent drafts a plan and waits for your approval before editing"}
      className={cn(
        "h-8 rounded-full px-3 text-[13px] transition-colors disabled:opacity-40",
        pressed
          ? "bg-selected text-ink"
          : "text-ink-3 enabled:hover:bg-hover enabled:hover:text-ink-2",
      )}
    >
      Plan first
    </button>
  );
}
