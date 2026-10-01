import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SaveStatus } from "@/features/settings/hooks/useSaveSettings";

const TEXT: Record<Exclude<SaveStatus, "idle">, string> = {
  saving: "Saving…",
  saved: "Saved",
  failed: "Not saved",
};

/** The quiet save state beside a section's title: it appears while saving and fades after. */
export function SavedMark({ status }: { status: SaveStatus }) {
  return (
    <span
      role="status"
      className={cn(
        "inline-flex items-center gap-1 text-[12px] transition-opacity duration-300",
        status === "idle" ? "opacity-0" : "opacity-100",
        status === "failed" ? "text-red" : "text-ink-3",
      )}
    >
      {status === "saved" && <Check className="size-3" />}
      {status !== "idle" && TEXT[status]}
    </span>
  );
}
