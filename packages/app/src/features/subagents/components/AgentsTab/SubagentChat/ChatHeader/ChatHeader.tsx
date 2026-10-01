import { RotateCcw, Square } from "lucide-react";
import type { Subagent } from "@/types";
import { usd } from "@/lib/utils";
import { useStore } from "@/stores/app-store";
import { Button } from "@/components/ui/Button/Button";
import { RoleTile } from "@/components/ui/RoleTile/RoleTile";
import { SubStatus } from "@/components/ui/SubStatus/SubStatus";
import { statusLabel } from "@/features/subagents/utils/roles";

/** Who the subagent is, where it stands, and the one action that fits: stop it or run it again. */
export function ChatHeader({ sub, parent }: { sub: Subagent; parent: string }) {
  const stopSubagent = useStore((s) => s.stopSubagent);
  const rerunSubagent = useStore((s) => s.rerunSubagent);

  return (
    <header className="flex items-center gap-3 border-b border-seam py-3 pr-3 pl-5">
      <RoleTile role={sub.role} />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[15px] font-semibold text-ink">
          <span className="truncate">{sub.name}</span>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-inset py-0.5 pr-2 pl-1.5 text-[12px] font-normal text-ink-2">
            <SubStatus status={sub.status} />
            {statusLabel[sub.status]}
          </span>
        </p>
        <p className="truncate text-[12.5px] text-ink-3">
          Subagent of {parent} · {sub.model} · {usd(sub.cost)}
        </p>
      </div>
      {sub.status === "running" ? (
        <Button size="sm" icon={<Square />} onClick={() => stopSubagent(sub.id)}>
          Stop
        </Button>
      ) : (
        <Button
          size="sm"
          icon={<RotateCcw />}
          disabled={sub.status === "queued"}
          onClick={() => rerunSubagent(sub.id)}
        >
          Run again
        </Button>
      )}
    </header>
  );
}
