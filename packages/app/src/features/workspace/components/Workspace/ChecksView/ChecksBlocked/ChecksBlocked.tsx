import { ListChecks } from "lucide-react";
import type { ShipFailureNote } from "@/lib/shipFailure";
import { ShipFailure } from "@/components/ship/CreatePrModal/ShipFailure/ShipFailure";

/** No pull request can exist yet because GitHub is out of reach: say what to fix, with the command to run. */
export function ChecksBlocked({ note }: { note: ShipFailureNote }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-10">
      <ListChecks className="size-6 text-ink-2" strokeWidth={1.75} />
      <p className="mt-3 text-[15px] font-medium text-ink">No pull request yet</p>
      <p className="mt-1 mb-4 text-[13.5px] text-ink-3">Checks come from GitHub.</p>
      <div className="w-full max-w-[380px]">
        <ShipFailure note={note} />
      </div>
    </div>
  );
}
