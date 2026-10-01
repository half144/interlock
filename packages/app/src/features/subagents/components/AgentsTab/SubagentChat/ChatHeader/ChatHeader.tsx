import type { Subagent } from "@/types";
import { RoleTile } from "@/components/ui/RoleTile/RoleTile";
import { SubStatus } from "@/components/ui/SubStatus/SubStatus";
import { statusLabel } from "@/features/subagents/utils/statusLabel";

export function ChatHeader({ sub, parent }: { sub: Subagent; parent: string }) {
  return (
    <header className="flex items-center gap-3 border-b border-seam py-3 pr-3 pl-5">
      <RoleTile />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
          <span className="truncate">{sub.name}</span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-inset py-0.5 pr-2 pl-1.5 text-[12px] font-normal text-ink-2">
            <SubStatus status={sub.status} />
            {statusLabel[sub.status]}
          </span>
        </p>
        <p className="truncate text-[12.5px] text-ink-3">
          Subagent of {parent}
          {sub.subtitle && ` · ${sub.subtitle}`}
        </p>
      </div>
    </header>
  );
}
