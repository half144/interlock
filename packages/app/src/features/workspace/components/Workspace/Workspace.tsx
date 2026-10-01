import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Agent, PanelTab } from "@/types";
import { cn } from "@/lib/utils";
import { dockCss, fadeIn, fadeOut } from "@/lib/motion";
import { surface } from "@/lib/styles";
import { PrButton } from "@/components/ship/PrButton/PrButton";
import { AgentsTab } from "@/features/subagents/components/AgentsTab/AgentsTab";
import { ChecksView } from "./ChecksView/ChecksView";
import { CodeTab } from "./CodeTab/CodeTab";
import { TerminalView } from "./TerminalView/TerminalView";
import { Toolbar } from "./Toolbar/Toolbar";
import { useWorkspace } from "./useWorkspace";

interface WorkspaceProps {
  agentId: string;
  onClose: () => void;
}

/** The agent's workspace beside the chat: code, terminal and checks, and the PR that ships it. */
export function Workspace({ agentId, onClose }: WorkspaceProps) {
  const { agent, panelTab, maximized, ready } = useWorkspace(agentId);
  if (!agent) return null;

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
      <Toolbar agent={agent} pr={agent.git && <PrButton agent={agent} />} onClose={onClose} />

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
              <TabContent tab={panelTab} agent={agent} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function TabContent({ tab, agent }: { tab: PanelTab; agent: Agent }) {
  switch (tab) {
    case "diff":
      return <CodeTab key={agent.id} agent={agent} />;
    case "terminal":
      return (
        <Frame>
          <TerminalView agent={agent} />
        </Frame>
      );
    case "checks":
      return (
        <Frame>
          <ChecksView agent={agent} />
        </Frame>
      );
    case "agents":
      return <AgentsTab agentId={agent.id} />;
  }
}

function Frame({ children }: { children: ReactNode }) {
  return <div className={cn(surface.frame, "h-full overflow-hidden")}>{children}</div>;
}
