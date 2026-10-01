import { useState } from "react";
import { useStore } from "@/stores/app-store";
import type { Project } from "@/types";
import { cn, usd } from "@/lib/utils";
import { field, monoText } from "@/lib/styles";
import { Toggle } from "@/components/ui/Toggle/Toggle";
import { Row } from "@/features/settings/components/Row/Row";
import { Section } from "@/features/settings/components/Section/Section";

export function Budget({ project }: { project: Project }) {
  const agents = useStore((s) => s.agents);
  const [cap, setCap] = useState(String(project.budget));
  const [pause, setPause] = useState(true);
  const [warn, setWarn] = useState(true);

  const spend = Object.values(agents)
    .filter((a) => a.projectId === project.id)
    .reduce((n, a) => n + a.cost, 0);
  const capValue = Number(cap) || 0;
  const ratio = capValue ? Math.min(1, spend / capValue) : 0;

  return (
    <Section
      id="budget"
      title="Budget"
      description="A daily ceiling for this project. Spend figures are synthetic demo numbers."
    >
      <Row label="Daily cap">
        <div className={cn(field, "flex h-9 w-32 items-center pl-3 focus-within:border-run/50")}>
          <span className={cn(monoText, "text-ink-3")}>$</span>
          <input
            aria-label="Daily cap in dollars"
            inputMode="decimal"
            value={cap}
            onChange={(e) => setCap(e.target.value.replace(/[^\d.]/g, ""))}
            className={cn(
              monoText,
              "h-full min-w-0 flex-1 bg-transparent px-1.5 text-ink focus:outline-none",
            )}
          />
        </div>
      </Row>
      <Row label="Spent today" hint={`${Math.round(ratio * 100)}% of today’s cap`}>
        <div className="flex w-56 flex-col items-end gap-2">
          <span className="text-[13px] tabular-nums text-ink-3">
            <span className="font-medium text-ink">{usd(spend)}</span> / {usd(capValue)}
          </span>
          <div
            className="h-1 w-full overflow-hidden rounded-full bg-selected"
            role="meter"
            aria-label="Daily cap used"
            aria-valuenow={Math.round(ratio * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full w-full origin-left rounded-full bg-ink-2 transition-transform duration-700 ease-out-expo"
              style={{ transform: `scaleX(${ratio})` }}
            />
          </div>
        </div>
      </Row>
      <Row
        label="Pause new tasks at the cap"
        hint="Running agents finish their current step; no new tasks start."
      >
        <Toggle label="Pause new tasks at the cap" checked={pause} onChange={setPause} />
      </Row>
      <Row label="Warn me at 80%" hint="A notification when today’s spend crosses 80% of the cap.">
        <Toggle label="Warn at 80 percent" checked={warn} onChange={setWarn} />
      </Row>
    </Section>
  );
}
