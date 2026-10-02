import { AnimatePresence, motion, type MotionValue } from "motion/react";
import { BarPiece } from "@/components/layout/BarPiece/BarPiece";
import { PrButton } from "@/components/ship/PrButton/PrButton";
import { dockCss, fadeIn, fadeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Toolbar } from "../Workspace/Toolbar/Toolbar";
import { useWorkspaceBar } from "./useWorkspaceBar";

/**
 * On a Mac the workspace's tabs live in the window bar, over the card they belong to. The frame stays mounted
 * and follows the dock; the toolbar fades in and out inside it.
 */
export function WorkspaceBar({
  agentId,
  open,
  maximized,
  left,
  width,
  onClose,
}: {
  agentId: string;
  open: boolean;
  maximized: boolean;
  left: MotionValue<number>;
  width: MotionValue<number>;
  onClose: () => void;
}) {
  const { agent, inBar } = useWorkspaceBar(agentId);
  if (!inBar) return null;

  return (
    <BarPiece
      frame={{ left, width }}
      className={cn("transition-[padding]", dockCss, !maximized && "pr-2")}
    >
      <AnimatePresence initial={false}>
        {open && agent && (
          <motion.div
            key="toolbar"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: fadeIn }}
            exit={{ opacity: 0, transition: fadeOut }}
            className="flex min-w-0 flex-1"
          >
            <Toolbar agent={agent} pr={agent.git && <PrButton agent={agent} />} onClose={onClose} />
          </motion.div>
        )}
      </AnimatePresence>
    </BarPiece>
  );
}
