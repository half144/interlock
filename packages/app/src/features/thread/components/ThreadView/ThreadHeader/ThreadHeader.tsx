import { ChevronDown, FileText, Share2, UserPlus } from "lucide-react";
import type { Agent } from "@/types";
import { agentLabel } from "@/lib/agentKinds";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import { MainBar } from "@/components/layout/MainBar/MainBar";
import { ChatSwitcher } from "./ChatSwitcher/ChatSwitcher";
import { TaskActions } from "./TaskActions/TaskActions";

interface ThreadHeaderProps {
  threadId: string;
  agent: Agent;
  panelOpen: boolean;
  maximized: boolean;
}

/** The chat column's header: the model and task actions on its own, fewer actions beside the panel, the chat switcher in the mini-IDE. */
export function ThreadHeader({ threadId, agent, panelOpen, maximized }: ThreadHeaderProps) {
  if (maximized) {
    // Docked beside the editor the chat is a side pane: its title lines up with the workspace toolbar.
    return (
      <header className="flex h-12 shrink-0 items-center border-b border-seam px-2">
        <ChatSwitcher threadId={threadId} />
      </header>
    );
  }

  return (
    <MainBar
      compact={panelOpen}
      left={
        <button
          type="button"
          className="inline-flex h-8 min-w-0 items-center gap-1.5 rounded-lg px-2 text-[16px] font-medium text-ink hover:bg-hover"
        >
          <span className="truncate">{agentLabel(agent)}</span>
          <span className="shrink-0 font-normal text-ink-3">{agent.model}</span>
          <ChevronDown className="size-4 shrink-0 text-ink-3" />
        </button>
      }
      right={
        panelOpen ? (
          <span className="flex items-center">
            <IconButton label="Collaborate">
              <UserPlus />
            </IconButton>
            <IconButton label="Share">
              <Share2 />
            </IconButton>
            <IconButton label="Task files">
              <FileText />
            </IconButton>
          </span>
        ) : (
          <TaskActions agent={agent} />
        )
      }
    />
  );
}
