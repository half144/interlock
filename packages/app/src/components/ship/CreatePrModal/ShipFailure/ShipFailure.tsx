import { TriangleAlert } from "lucide-react";
import type { ShipFailureNote } from "@/lib/shipFailure";
import { CopyField } from "@/components/ship/CopyField/CopyField";

interface ShipFailureProps {
  note: ShipFailureNote;
  /** The daemon's own words, when they add to the advice. */
  detail?: string | undefined;
}

/** Why the pull request cannot be created, and the one thing to do about it. */
export function ShipFailure({ note, detail }: ShipFailureProps) {
  return (
    <div role="alert" className="rounded-lg border border-hold/40 bg-hold/10 p-3">
      <p className="flex items-center gap-2 text-[13.5px] font-medium text-ink">
        <TriangleAlert className="size-4 shrink-0 text-hold" />
        {note.title}
      </p>
      <p className="mt-1 text-[13px] leading-[1.5] text-ink-2">{note.hint}</p>
      {note.command && (
        <div className="mt-2.5">
          <CopyField value={note.command} label="Copy command" />
        </div>
      )}
      {detail && (
        <p className="mt-2.5 text-[12px] leading-[1.5] break-words whitespace-pre-wrap text-ink-3">
          {detail}
        </p>
      )}
    </div>
  );
}
