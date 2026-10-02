import { AnimatePresence, motion, type MotionValue } from "motion/react";
import type { Agent } from "@/types";
import { easeIn, easeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ThreadHeader } from "../ThreadHeader/ThreadHeader";
import { FreshPresence } from "@/components/ui/FreshPresence/FreshPresence";
import { Transcript } from "../Transcript/Transcript";
import { useChatColumn } from "./useChatColumn";

interface ChatColumnProps {
  threadId: string;
  agent: Agent;
  panelOpen: boolean;
  maximized: boolean;
  left: MotionValue<number>;
  width: MotionValue<number>;
  opacity: MotionValue<number>;
  reading: MotionValue<number>;
}

export function ChatColumn({
  threadId,
  agent,
  panelOpen,
  maximized,
  left,
  width,
  opacity,
  reading,
}: ChatColumnProps) {
  const { focus } = useChatColumn(reading);

  return (
    <motion.div
      className={cn(
        "absolute inset-y-0 flex min-w-0 flex-col",
        maximized && "border-l border-seam",
      )}
      style={{ left, width, opacity }}
    >
      <ThreadHeader threadId={threadId} agent={agent} panelOpen={panelOpen} maximized={maximized} />
      {/* Switching chats: the old conversation fades out on top while the new one fades in beneath it, in place. */}
      <div className="relative min-h-0 flex-1">
        <AnimatePresence initial={false}>
          <motion.div
            key={threadId}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.16, ease: easeOut } }}
            exit={{ opacity: 0, transition: { duration: 0.16, ease: easeIn } }}
            style={{ filter: focus }}
            className="absolute inset-0 flex flex-col"
          >
            <FreshPresence>
              <Transcript threadId={threadId} reading={reading} />
            </FreshPresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
