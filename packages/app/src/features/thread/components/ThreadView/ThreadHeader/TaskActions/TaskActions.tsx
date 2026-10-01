import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GitPullRequest, Share2 } from "lucide-react";
import type { Agent } from "@/types";
import { useStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut } from "@/lib/motion";
import { DiffStat } from "@/components/ui/DiffStat/DiffStat";
import { monoText } from "@/lib/styles";
import { isFinished } from "@/lib/agentStatus";
import { TaskMenu } from "./TaskMenu/TaskMenu";

/** Header actions for a task: PR, share, the diff toggle, and the rest in a menu. */
export function TaskActions({ agent }: { agent: Agent }) {
  const panelOpen = useStore((s) => s.panelOpen);
  const panelTab = useStore((s) => s.panelTab);
  const openPanel = useStore((s) => s.openPanel);
  const setPanelOpen = useStore((s) => s.setPanelOpen);
  const diffOpen = panelOpen && panelTab === "diff";

  return (
    <div className="relative flex items-center gap-0.5">
      {/* The PR action appears the moment the work is ready, so it arrives instead of just being there. */}
      <AnimatePresence initial={false} mode="popLayout">
        {isFinished(agent) && (
          <motion.span
            key={agent.aspect}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1, transition: fadeIn }}
            exit={{ opacity: 0, scale: 0.95, transition: fadeOut }}
          >
            {agent.aspect === "review" ? (
              <Ghost onClick={() => openPanel("diff")}>
                <GitPullRequest className="size-4" />
                Create PR
              </Ghost>
            ) : (
              <Ghost>
                <GitPullRequest className="size-4" />
                PR #{agent.pr}
              </Ghost>
            )}
          </motion.span>
        )}
      </AnimatePresence>
      <Ghost>
        <Share2 className="size-4" />
        Share
      </Ghost>
      <button
        type="button"
        onClick={() => (diffOpen ? setPanelOpen(false) : openPanel("diff"))}
        aria-pressed={diffOpen}
        aria-label={`Changes: ${agent.additions} added, ${agent.deletions} removed`}
        className={cn(
          monoText,
          "mx-1 inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 tabular-nums transition-[background-color,border-color,scale] duration-150 ease-out-quint active:scale-[0.97]",
          diffOpen ? "border-seam-2 bg-selected" : "border-seam hover:bg-hover",
        )}
      >
        <DiffStat additions={agent.additions} deletions={agent.deletions} />
      </button>
      <TaskMenu agentId={agent.id} />
    </div>
  );
}

function Ghost({ onClick, children }: { onClick?: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[14px] text-ink transition-[background-color,scale] duration-150 ease-out-quint hover:bg-hover active:scale-[0.97]"
    >
      {children}
    </button>
  );
}
