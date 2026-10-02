import type { Agent } from "@/types";
import { agentLabel } from "@/lib/agentKinds";
import { BarPiece, type BarFrame } from "@/components/layout/BarPiece/BarPiece";
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
  frame: BarFrame;
}

export function ThreadHeader({ threadId, agent, panelOpen, maximized, frame }: ThreadHeaderProps) {
  if (maximized) {
    // Docked beside the editor the chat is a side pane: its title lines up with the workspace toolbar.
    return (
      <BarPiece frame={frame} className="border-l border-seam">
        <header
          data-tauri-drag-region
          className="flex h-12 shrink-0 items-center border-b border-seam px-2 mac:h-full mac:min-w-0 mac:flex-1 mac:border-b-0"
        >
          <ChatSwitcher threadId={threadId} />
        </header>
      </BarPiece>
    );
  }

  return (
    <MainBar
      compact={panelOpen}
      frame={frame}
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
