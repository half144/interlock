import { AnimatePresence, motion } from "motion/react";
import { useStore } from "@/stores/app-store";
import { dock, dockCss, easeIn, easeOut, fadeIn } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Workspace } from "@/features/workspace/components/Workspace/Workspace";
import { StatusBar } from "@/features/workspace/components/editor/StatusBar/StatusBar";
import { useSidebarWidth } from "@/hooks/useRail";
import { useSplit } from "@/features/thread/hooks/useSplit";
import { useThread } from "@/features/thread/hooks/useThread";
import { ThreadHeader } from "./ThreadHeader/ThreadHeader";
import { Transcript } from "./Transcript/Transcript";

/**
 * Chat first. Opening the worktree splits the page: the chat narrows on the same spring as the sidebar and
 * the workspace rides in on its edge. Maximizing the review turns the same pieces into a mini-IDE (explorer and
 * editor on the left, the chat docked on the right, a status bar under both) without remounting anything, so
 * nothing loses its place.
 */
export function ThreadView({ threadId }: { threadId: string }) {
  const { agent } = useThread(threadId);
  const panelOpen = useStore((s) => s.panelOpen);
  const maximized = useStore((s) => s.reviewMaximized);
  const setPanelOpen = useStore((s) => s.setPanelOpen);
  const { chatLeft, chatWidth, chatOpacity, panelLeft, panelWidth, reading } = useSplit(
    panelOpen,
    useSidebarWidth(),
    maximized,
  );

  if (!agent) return null;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <motion.div
          className={cn(
            "absolute inset-y-0 flex min-w-0 flex-col",
            maximized && "border-l border-seam",
          )}
          style={{ left: chatLeft, width: chatWidth, opacity: chatOpacity }}
        >
          <ThreadHeader
            threadId={threadId}
            agent={agent}
            panelOpen={panelOpen}
            maximized={maximized}
          />
          {/* Switching chats: the old conversation fades out on top while the new one fades in beneath it, in place. */}
          <div className="relative min-h-0 flex-1">
            <AnimatePresence initial={false}>
              <motion.div
                key={threadId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.16, ease: easeOut } }}
                exit={{ opacity: 0, transition: { duration: 0.16, ease: easeIn } }}
                className="absolute inset-0 flex flex-col"
              >
                <Transcript threadId={threadId} reading={reading} />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
        {/* The frame stays mounted and only moves; the workspace inside fades in and out. A frame mounted on the
            same commit its position starts animating can have that animation cut short. */}
        <motion.div
          className={cn(
            "absolute inset-y-0 flex transition-[padding]",
            dockCss,
            maximized ? "p-0" : "py-2 pr-2",
          )}
          style={{ left: panelLeft, width: panelWidth }}
        >
          <AnimatePresence initial={false}>
            {panelOpen && (
              <motion.div
                key="workspace"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: fadeIn }}
                exit={{ opacity: 0, transition: { duration: dock.visualDuration, ease: easeIn } }}
                className="flex min-w-0 flex-1"
              >
                <Workspace agentId={agent.id} onClose={() => setPanelOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
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
