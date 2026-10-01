import { useId } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import {
  Code2,
  GitBranch,
  ListChecks,
  Maximize2,
  Minimize2,
  Monitor,
  MoreHorizontal,
  Network,
  Settings2,
  Share2,
  SquareTerminal,
  X,
  type LucideIcon,
} from "lucide-react";
import type { Agent, PanelTab } from "@/types";
import { useStore } from "@/stores/app-store";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import { fadeIn, fadeOut } from "@/lib/motion";
import { useSubagents } from "@/hooks/useSubagents";
import { PrButton } from "@/features/workspace/components/Workspace/Toolbar/PrButton/PrButton";
import { WorkspaceTab } from "./WorkspaceTab/WorkspaceTab";

const TABS: { value: PanelTab; label: string; icon: LucideIcon }[] = [
  { value: "preview", label: "Preview", icon: Monitor },
  { value: "diff", label: "Code", icon: Code2 },
  { value: "terminal", label: "Terminal", icon: SquareTerminal },
  { value: "checks", label: "Checks", icon: ListChecks },
  { value: "agents", label: "Agents", icon: Network },
];

interface ToolbarProps {
  agent: Agent;
  prNumber?: number | undefined;
  onOpenPr: () => void;
  onClose: () => void;
}

export function Toolbar({ agent, prNumber, onOpenPr, onClose }: ToolbarProps) {
  const panelTab = useStore((s) => s.panelTab);
  const setPanelTab = useStore((s) => s.setPanelTab);
  const go = useStore((s) => s.go);
  const maximized = useStore((s) => s.reviewMaximized);
  const setMaximized = useStore((s) => s.setReviewMaximized);
  const subCount = useSubagents(agent.id).length;
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
              count={tab.value === "agents" ? subCount : undefined}
              onSelect={setPanelTab}
            />
          ))}
        </nav>
      </LayoutGroup>
      <span aria-hidden className="mx-1 h-4 w-px bg-seam" />
      <IconButton
        label="Project settings"
        onClick={() => go({ kind: "settings", projectId: agent.projectId })}
      >
        <Settings2 />
      </IconButton>

      <div className="ml-auto flex items-center gap-1">
        <IconButton label="More">
          <MoreHorizontal />
        </IconButton>
        <IconButton label={agent.branch}>
          <GitBranch />
        </IconButton>
        <button
          type="button"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[13.5px] text-ink hover:bg-hover"
        >
          <Share2 className="size-4" />
          Share
        </button>
        <PrButton agent={agent} prNumber={prNumber} onOpen={onOpenPr} />
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
                onClick={() => setMaximized(!maximized)}
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
