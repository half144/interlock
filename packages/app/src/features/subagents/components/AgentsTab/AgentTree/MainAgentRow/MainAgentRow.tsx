import { CircleAlert } from "lucide-react";
import type { Agent } from "@/types";
import { agentLabel } from "@/lib/agentKinds";
import { isFinished } from "@/lib/agentStatus";
import { cn } from "@/lib/utils";
import { AgentMark } from "@/components/ui/AgentMark/AgentMark";
import { StepIcon } from "@/components/ui/StepIcon/StepIcon";
import { TreeSelection } from "@/features/subagents/components/tree/TreeSelection/TreeSelection";

export function MainAgentRow({
  agent,
  selected,
  onSelect,
}: {
  agent: Agent;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-current={selected}
      className={cn(
        "relative isolate mx-2 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
        !selected && "hover:bg-hover",
      )}
    >
      {selected && <TreeSelection />}
      <AgentMark kind={agent.kind} className="size-6" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13.5px] font-medium text-ink">
          {agentLabel(agent)}
        </span>
        <span className="block text-[12px] text-ink-3">
          Main agent · {agent.model}
          {agent.effort ? ` · ${agent.effort}` : ""}
        </span>
      </span>
      {agent.aspect === "held" ? (
        <CircleAlert className="size-4 shrink-0 text-hold" aria-label="Needs you" />
      ) : (
        <StepIcon
          status={
            agent.aspect === "running" ? "in_progress" : isFinished(agent) ? "completed" : "pending"
          }
        />
      )}
    </button>
  );
}
