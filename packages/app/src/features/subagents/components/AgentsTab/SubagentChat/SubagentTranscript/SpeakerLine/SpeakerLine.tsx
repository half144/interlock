import { Lock } from "lucide-react";
import type { Subagent } from "@/types";
import { tools } from "@/lib/tools";
import { roleAccess } from "@/features/subagents/utils/roles";
import { RoleTile } from "@/components/ui/RoleTile/RoleTile";

/** Who's talking, and what it's allowed to touch: the same tools list an agent definition declares. */
export function SpeakerLine({ sub }: { sub: Subagent }) {
  const access = roleAccess[sub.role];
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
      <RoleTile role={sub.role} className="size-6 rounded-md [&_svg]:size-3.5" />
      <span className="text-[14px] font-medium text-ink">{sub.name}</span>
      <span className="text-[12.5px] text-ink-3">{sub.model} · fresh context</span>
      <span className="flex basis-full flex-wrap gap-1.5 pl-8">
        {access.tools.map((t) => {
          const Icon = tools[t].icon;
          return (
            <span
              key={t}
              className="inline-flex h-6 items-center gap-1.5 rounded-full bg-inset px-2.5 text-[12px] text-ink-2"
            >
              <Icon className="size-3 text-ink-3" />
              {tools[t].label}
            </span>
          );
        })}
        {access.readOnly && (
          <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-seam px-2.5 text-[12px] text-ink-3">
            <Lock className="size-3" />
            Read-only
          </span>
        )}
      </span>
    </div>
  );
}
