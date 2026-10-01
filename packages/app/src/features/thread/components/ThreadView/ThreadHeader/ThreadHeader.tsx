import type { Agent } from "@/types";
import { agentLabel } from "@/lib/agentKinds";
import { MainBar } from "@/components/layout/MainBar/MainBar";
import { PrButton } from "@/components/ship/PrButton/PrButton";
import { ChatSwitcher } from "./ChatSwitcher/ChatSwitcher";
import { TaskActions } from "./TaskActions/TaskActions";
import { TaskMenu } from "./TaskActions/TaskMenu/TaskMenu";

interface ThreadHeaderProps {
  threadId: string;
  agent: Agent;
  panelOpen: boolean;
  maximized: boolean;
}

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
        <span className="inline-flex h-8 min-w-0 items-center gap-1.5 px-2 text-[16px] font-medium text-ink">
          <span className="truncate">{agentLabel(agent)}</span>
          <span className="shrink-0 font-normal text-ink-3">{agent.model}</span>
        </span>
      }
      right={
        panelOpen ? (
          <TaskMenu agent={agent} />
        ) : (
          <TaskActions
            agent={agent}
            ship={<PrButton agent={agent} />}
            menu={<TaskMenu agent={agent} />}
          />
        )
      }
    />
  );
}
