import { CornerDownRight } from "lucide-react";
import type { Subagent } from "@/types";
import { RoleTile } from "@/components/ui/RoleTile/RoleTile";

/** One subagent's result in the overview, and the step that used it. */
export function ReturnedResult({ sub, onOpen }: { sub: Subagent; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full gap-3 rounded-xl border border-seam p-3 text-left transition-colors hover:bg-hover"
    >
      <RoleTile role={sub.role} />
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-medium text-ink">{sub.name}</span>
        <span className="mt-0.5 line-clamp-2 block text-[13px] leading-[1.55] text-ink-2">
          {sub.result}
        </span>
        {sub.usedIn && (
          <span className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-ink-3">
            <CornerDownRight className="size-3.5" />
            Used in “{sub.usedIn}”
          </span>
        )}
      </span>
    </button>
  );
}
