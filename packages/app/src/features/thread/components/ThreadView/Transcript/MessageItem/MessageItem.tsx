import { memo } from "react";
import { motion } from "motion/react";
import type { Message } from "@/types";
import { rise } from "@/features/thread/utils/rise";
import { AgentMessage } from "./AgentMessage/AgentMessage";

/**
 * A new message rises in; a new agent reply settles block by block, a beat apart. Messages already on screen
 * never replay it. Memoized because opening the side panel re-renders the transcript, and re-rendering every
 * message (preview mocks included) on that frame cost the panel its first frames of motion.
 */
export const MessageItem = memo(function MessageItem({
  message,
  animate,
}: {
  message: Message;
  animate: boolean;
}) {
  return (
    <motion.div initial={animate ? "hidden" : false} animate="shown">
      {message.role === "user" ? (
        <motion.div variants={rise} custom={0} className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl border border-seam bg-raised px-4 py-3 text-[15px] leading-[1.6] text-ink shadow-button [text-wrap:pretty]">
            {message.text}
          </div>
        </motion.div>
      ) : (
        <AgentMessage blocks={message.blocks} agentId={message.agentId} />
      )}
    </motion.div>
  );
});
