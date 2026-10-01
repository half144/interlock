import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { projectById } from "@/mocks/projects";
import { useStore } from "@/stores/app-store";
import type { Agent } from "@/types";
import { cn } from "@/lib/utils";
import { dockCss, fadeIn, fadeOut } from "@/lib/motion";
import { surface } from "@/lib/styles";
import { AgentsTab } from "@/features/subagents/components/AgentsTab/AgentsTab";
import { useDeferredMount } from "@/features/workspace/hooks/useDeferredMount";
import { usePullRequest } from "@/features/workspace/hooks/usePullRequest";
import { ChecksView } from "./ChecksView/ChecksView";
import { CodeTab } from "./CodeTab/CodeTab";
import { PrLiveModal } from "./PrLiveModal/PrLiveModal";
import { PreviewFrame } from "./PreviewFrame/PreviewFrame";
import { TerminalView } from "./TerminalView/TerminalView";
import { Toolbar } from "./Toolbar/Toolbar";

/** The agent's workspace beside the chat: preview, code, terminal and checks, and the PR that ships it. */
export function Workspace({ agentId, onClose }: { agentId: string; onClose: () => void }) {
  const agent = useStore((s) => s.agents[agentId]);
  return agent ? <WorkspaceBody agent={agent} onClose={onClose} /> : null;
}

function WorkspaceBody({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const panelTab = useStore((s) => s.panelTab);
  const setPanelTab = useStore((s) => s.setPanelTab);
  const maximized = useStore((s) => s.reviewMaximized);
  const pr = usePullRequest(agent);
  const project = projectById[agent.projectId];
  // The tab can be a thousand-node diff; the slide-in never waits on it.
  const ready = useDeferredMount();

  return (
    // Maximized, the card loses its corners, shadow and gutters on the layout's spring: an editor sits flush.
    <div
      className={cn(
        surface.card,
        "flex h-full w-full min-w-0 flex-col overflow-hidden transition-[border-radius,border-color,box-shadow]",
        dockCss,
        maximized && "rounded-none border-transparent shadow-none",
      )}
    >
      <Toolbar agent={agent} prNumber={pr.prNumber} onOpenPr={pr.open} onClose={onClose} />

      <div
        className={cn(
          "min-h-0 flex-1 bg-panel transition-[padding]",
          dockCss,
          maximized ? "p-0" : "p-2",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {ready && (
            <motion.div
              key={panelTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: fadeIn }}
              exit={{ opacity: 0, transition: fadeOut }}
              className="h-full"
            >
              {panelTab === "preview" && <PreviewFrame key={agent.id} agent={agent} />}
              {panelTab === "diff" && <CodeTab key={agent.id} agent={agent} />}
              {panelTab === "terminal" && (
                <Frame>
                  <TerminalView agent={agent} />
                </Frame>
              )}
              {panelTab === "agents" && <AgentsTab agentId={agent.id} />}
              {panelTab === "checks" && (
                <Frame>
                  <ChecksView agent={agent} prNumber={pr.prNumber} />
                </Frame>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {pr.live !== null && project && (
          <PrLiveModal
            repo={project.repo}
            number={pr.live}
            onClose={pr.dismiss}
            onChecks={() => {
              setPanelTab("checks");
              pr.dismiss();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return <div className={cn(surface.frame, "h-full overflow-hidden")}>{children}</div>;
}
