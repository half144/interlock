import { useId, type ReactNode } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import {
  Code2,
  ListChecks,
  Maximize2,
  Minimize2,
  Network,
  Settings2,
  SquareTerminal,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Agent, PanelTab } from "@/types";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import { fadeIn, fadeOut } from "@/lib/motion";
import { WorkspaceTab } from "./WorkspaceTab/WorkspaceTab";
import { useToolbar } from "./useToolbar";

const TABS: { value: PanelTab; label: string; icon: LucideIcon }[] = [
  { value: "diff", label: "Code", icon: Code2 },
  { value: "terminal", label: "Terminal", icon: SquareTerminal },
  { value: "checks", label: "Checks", icon: ListChecks },
  { value: "agents", label: "Agents", icon: Network },
];

interface ToolbarProps {
  agent: Agent;
  /** The task's pull request control, which the thread header shares. */
  pr: ReactNode;
  onClose: () => void;
}

export function Toolbar({ agent, pr, onClose }: ToolbarProps) {
  const { panelTab, selectTab, subagentCount, maximized, toggleMaximized, openSettings } =
    useToolbar(agent.id, agent.projectId);
  const group = useId();

  return (
    <div className="flex h-12 shrink-0 items-center gap-1 border-b border-seam px-2">
      {/* The active tab widens to show its label: the pill slides and the neighbours glide over instead of jumping. */}
      <LayoutGroup id={group}>
        <nav role="tablist" aria-label="Workspace" className="flex items-center gap-0.5">
          {TABS.map((tab) => (
            <WorkspaceTab
              key={tab.value}
              {...tab}
              active={panelTab}
              count={tab.value === "agents" ? subagentCount : undefined}
              onSelect={selectTab}
            />
          ))}
        </nav>
      </LayoutGroup>
      <span aria-hidden className="mx-1 h-4 w-px bg-seam" />
      <IconButton label="Project settings" onClick={openSettings}>
        <Settings2 />
      </IconButton>

      <div className="ml-auto flex items-center gap-1">
        {pr}
        {/* Only the review can grow into the mini-IDE. */}
        <AnimatePresence initial={false}>
          {panelTab === "diff" && (
            <motion.span
              key="maximize"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1, transition: fadeIn }}
              exit={{ opacity: 0, scale: 0.85, transition: fadeOut }}
              className="ml-1 flex"
            >
              <IconButton
                label={maximized ? "Restore layout (Esc)" : "Maximize review"}
                onClick={toggleMaximized}
              >
                {maximized ? <Minimize2 /> : <Maximize2 />}
              </IconButton>
            </motion.span>
          )}
        </AnimatePresence>
        <IconButton label="Close workspace" onClick={onClose}>
          <X />
        </IconButton>
      </div>
    </div>
  );
}
