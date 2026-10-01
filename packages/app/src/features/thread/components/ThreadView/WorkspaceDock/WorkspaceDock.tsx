import { AnimatePresence, motion, type MotionValue } from "motion/react";
import { dock, dockCss, easeIn, fadeIn } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { Workspace } from "@/features/workspace/components/Workspace/Workspace";

interface WorkspaceDockProps {
  agentId: string;
  open: boolean;
  maximized: boolean;
  left: MotionValue<number>;
  width: MotionValue<number>;
  onClose: () => void;
}

/**
 * The frame stays mounted and only moves; the workspace inside fades in and out. A frame mounted on the
 * same commit its position starts animating can have that animation cut short.
 */
export function WorkspaceDock({
  agentId,
  open,
  maximized,
  left,
  width,
  onClose,
}: WorkspaceDockProps) {
  return (
    <motion.div
      className={cn(
        "absolute inset-y-0 flex transition-[padding]",
        dockCss,
        maximized ? "p-0" : "py-2 pr-2",
      )}
      style={{ left, width }}
    >
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: fadeIn }}
            exit={{ opacity: 0, transition: { duration: dock.visualDuration, ease: easeIn } }}
            className="flex min-w-0 flex-1"
          >
            <Workspace agentId={agentId} onClose={onClose} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
