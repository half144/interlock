import { AnimatePresence, motion } from "motion/react";
import { GitBranch } from "lucide-react";
import { AgentMark } from "@/components/ui/AgentMark/AgentMark";
import { ComposerTray } from "@/components/ui/ComposerTray/ComposerTray";
import { fadeIn, fadeOut } from "@/lib/motion";
import { useReadyTray } from "./useReadyTray";

/** Under the empty composer, where a project's tray will be: how tasks run, and the agents signed in to run them. */
export function ReadyTray() {
  const { agents } = useReadyTray();

  return (
    <ComposerTray className="gap-3 pt-[21px] pr-4 pb-1.5 pl-4">
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <GitBranch className="size-3 shrink-0" />
        <span className="truncate">Every task runs in its own worktree</span>
      </span>
      <AnimatePresence initial={false}>
        {agents.map((agent) => (
          <motion.span
            key={agent.kind}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: fadeIn }}
            exit={{ opacity: 0, transition: fadeOut }}
            className="flex shrink-0 items-center gap-1.5 text-ink-2"
          >
            <AgentMark kind={agent.kind} className="size-3.5" />
            {agent.label}
            {agent.plan && <span className="text-ink-3 capitalize">{agent.plan}</span>}
          </motion.span>
        ))}
      </AnimatePresence>
    </ComposerTray>
  );
}
