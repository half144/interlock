import { Calendar, GitPullRequest, OctagonAlert, Tag } from "lucide-react";
import { projectOf } from "@/mocks/projects";
import { ago, cn } from "@/lib/utils";
import type { Aspect, Automation, AutomationRun, Trigger } from "@/types";
import { AgentMark } from "@/components/ui/AgentMark/AgentMark";
import { Lamp } from "@/components/ui/Lamp/Lamp";
import { Toggle } from "@/components/ui/Toggle/Toggle";

const triggerIcon: Record<Trigger["type"], typeof Calendar> = {
  schedule: Calendar,
  issue: Tag,
  alert: OctagonAlert,
  pr: GitPullRequest,
};

const runAspect: Record<AutomationRun["result"], Aspect> = {
  merged: "merged",
  review: "review",
  failed: "failed",
  skipped: "queued",
};

const runLabel: Record<AutomationRun["result"], string> = {
  merged: "Merged",
  review: "Ready for review",
  failed: "Failed",
  skipped: "Skipped, nothing new",
};

const triggerText = (t: Trigger) => (t.type === "alert" ? `${t.source} alert` : t.label);

interface AutomationRowProps {
  automation: Automation;
  onToggle: () => void;
}

export function AutomationRow({ automation: a, onToggle }: AutomationRowProps) {
  const Icon = triggerIcon[a.trigger.type];
  const runs = a.runs.slice(0, 5);
  // A paused automation fades everything but its toggle.
  const dim = !a.enabled && "opacity-60";

  return (
    <article className="grid grid-cols-[28px_minmax(0,1fr)_180px_136px_96px_auto] items-center gap-4 px-4 py-3.5">
      <span
        className={cn(
          "flex size-7 items-center justify-center rounded-md bg-hover text-ink-2",
          dim,
        )}
      >
        <Icon className="size-3.5" />
      </span>

      <div className={cn("min-w-0", dim)}>
        <h2 className="truncate text-[13.5px] font-medium text-ink">{a.name}</h2>
        <p className="mt-0.5 truncate text-[12.5px] text-ink-3">
          <span className="text-ink-2">{projectOf(a.projectId).name}</span> · {a.prompt}
        </p>
      </div>

      <div className={cn("min-w-0 text-[12.5px]", dim)}>
        <p className="truncate text-ink-2">{triggerText(a.trigger)}</p>
        {a.trigger.type === "schedule" && (
          <code className="font-mono text-[11.5px] text-ink-3">{a.trigger.cron}</code>
        )}
      </div>

      <span className={cn("flex min-w-0 items-center gap-1.5 text-[12.5px] text-ink-3", dim)}>
        <AgentMark kind={a.kind} />
        <span className="truncate">{a.model}</span>
      </span>

      <div role="group" aria-label="Recent runs" className={cn("flex items-center gap-1", dim)}>
        {runs.length === 0 && <span className="text-[12px] text-ink-3">No runs yet</span>}
        {runs.map((run) => {
          const summary = `${run.headcode} · ${runLabel[run.result]} · ${ago(run.minAgo)} ago`;
          return (
            <span
              key={run.headcode}
              role="img"
              aria-label={summary}
              title={summary}
              className="inline-flex"
            >
              <Lamp aspect={runAspect[run.result]} />
            </span>
          );
        })}
      </div>

      <Toggle
        label={`${a.enabled ? "Pause" : "Resume"} ${a.name}`}
        checked={a.enabled}
        onChange={onToggle}
      />
    </article>
  );
}
