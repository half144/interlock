import { GitPullRequest } from "lucide-react";
import type { Agent } from "@/types";
import { cn } from "@/lib/utils";

export function PrStatusBar({ agent, pr }: { agent: Agent; pr: number }) {
  return (
    <div className="flex h-11 items-center gap-2.5 border-b border-seam px-4 text-[13px]">
      <GitPullRequest className="size-4 text-ink-3" />
      <span className="text-ink">#{pr}</span>
      <span className="truncate text-ink-3">{agent.title}</span>
      <span
        className={cn(
          "ml-auto shrink-0 text-xs font-medium",
          agent.aspect === "merged" ? "text-green" : "text-ink-2",
        )}
      >
        {agent.aspect === "merged" ? "Merged" : "Open · 1 approval required"}
      </span>
    </div>
  );
}
