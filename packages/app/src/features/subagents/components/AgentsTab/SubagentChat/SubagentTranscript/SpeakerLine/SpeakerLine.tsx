import type { Subagent } from "@/types";
import { RoleTile } from "@/components/ui/RoleTile/RoleTile";

export function SpeakerLine({ sub }: { sub: Subagent }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <RoleTile className="size-6 rounded-md [&_svg]:size-3.5" />
      <span className="text-[14px] font-medium text-ink">{sub.name}</span>
    </div>
  );
}
