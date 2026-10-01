import { useState } from "react";
import type { Agent } from "@/types";
import { useStore } from "@/stores/app-store";
import { checksFor, failureOutput } from "@/features/workspace/utils/checks";
import { CheckRow } from "./CheckRow/CheckRow";
import { Lever } from "./Lever/Lever";
import { PrStatusBar } from "./PrStatusBar/PrStatusBar";

export function ChecksView({ agent, prNumber }: { agent: Agent; prNumber?: number | undefined }) {
  const logs = useStore((s) => s.logs[agent.id]);
  const [open, setOpen] = useState<string | null>(null);
  const [autoFix, setAutoFix] = useState(true);
  const [autoMerge, setAutoMerge] = useState(false);
  const failure = failureOutput(agent, logs);

  return (
    <div className="h-full overflow-y-auto">
      {prNumber && <PrStatusBar agent={agent} pr={prNumber} />}

      <ul>
        {checksFor(agent).map((check) => (
          <CheckRow
            key={check.name}
            check={check}
            expanded={open === check.name}
            output={failure}
            onToggle={() => setOpen(open === check.name ? null : check.name)}
          />
        ))}
      </ul>

      <div className="flex flex-col gap-4 px-4 py-5">
        <Lever
          label="Auto-fix failing checks"
          detail={`Sends failures back to ${agent.headcode} and re-runs, up to 3 times.`}
          checked={autoFix}
          onChange={setAutoFix}
        />
        <Lever
          label="Auto-merge when green"
          detail="Merges into main once required checks pass and a reviewer approves."
          checked={autoMerge}
          onChange={setAutoMerge}
        />
      </div>
    </div>
  );
}
