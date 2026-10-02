import { motion } from "motion/react";
import { dock } from "@/lib/motion";
import { WorkspaceBar } from "@/features/workspace/components/WorkspaceBar/WorkspaceBar";
import { StatusBar } from "@/features/workspace/components/editor/StatusBar/StatusBar";
import { ChatColumn } from "./ChatColumn/ChatColumn";
import { useThreadView } from "./useThreadView";
import { WorkspaceDock } from "./WorkspaceDock/WorkspaceDock";

/**
 * Chat first. Opening the worktree splits the page: the chat narrows on the same spring as the sidebar and
 * the workspace rides in on its edge. Maximizing the review turns the same pieces into a mini-IDE (explorer and
 * editor on the left, the chat docked on the right, a status bar under both) without remounting anything, so
 * nothing loses its place.
 */
export function ThreadView({ threadId }: { threadId: string }) {
  const { agent, panelOpen, maximized, frame, closePanel } = useThreadView(threadId);
  if (!agent) return null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="relative min-h-0 flex-1 overflow-clip">
        <ChatColumn
          threadId={threadId}
          agent={agent}
          panelOpen={panelOpen}
          maximized={maximized}
          left={frame.chatLeft}
          width={frame.chatWidth}
          opacity={frame.chatOpacity}
          reading={frame.reading}
        />
        <WorkspaceDock
          agentId={agent.id}
          open={panelOpen}
          maximized={maximized}
          left={frame.panelLeft}
          width={frame.panelWidth}
          onClose={closePanel}
        />
        <WorkspaceBar
          agentId={agent.id}
          open={panelOpen}
          maximized={maximized}
          left={frame.panelLeft}
          width={frame.panelWidth}
          onClose={closePanel}
        />
      </div>
      <motion.div
        initial={false}
        animate={{ height: maximized ? 24 : 0 }}
        transition={dock}
        className="shrink-0 overflow-hidden"
      >
        <StatusBar agent={agent} />
      </motion.div>
    </div>
  );
}
