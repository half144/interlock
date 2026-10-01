import { AnimatePresence, motion } from "motion/react";
import { Network } from "lucide-react";
import { useStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut } from "@/lib/motion";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { surface } from "@/lib/styles";
import { useSubagents } from "@/hooks/useSubagents";
import { SubagentChat } from "./SubagentChat/SubagentChat";
import { MainOverview } from "./MainOverview/MainOverview";
import { AgentTree } from "./AgentTree/AgentTree";

/** Every agent on this task: the main agent on top, its subagents beneath, and the selected one's chat on the right. */
export function AgentsTab({ agentId }: { agentId: string }) {
  const agent = useStore((s) => s.agents[agentId]);
  const selected = useStore((s) => s.selectedSubagentId);
  const subs = useSubagents(agentId);
  const current = subs.find((s) => s.id === selected);

  if (!agent) return null;

  if (subs.length === 0) {
    return (
      <div className={cn(surface.frame, "h-full")}>
        <EmptyState
          icon={Network}
          title="No subagents on this task"
          description="When the agent splits work, like exploring the codebase or writing tests, each helper shows up here as a chat you can read and message."
        />
      </div>
    );
  }

  return (
    <div className={cn(surface.frame, "flex h-full overflow-hidden")}>
      <AgentTree agent={agent} subs={subs} current={current} />
      <section className="flex min-w-0 flex-1 flex-col">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={current?.id ?? "main"}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0, transition: fadeIn }}
            exit={{ opacity: 0, transition: fadeOut }}
            className="flex min-h-0 flex-1 flex-col"
          >
            {current ? (
              <SubagentChat sub={current} agent={agent} />
            ) : (
              <div className="min-h-0 flex-1 overflow-y-auto">
                <MainOverview agent={agent} subs={subs} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
}
