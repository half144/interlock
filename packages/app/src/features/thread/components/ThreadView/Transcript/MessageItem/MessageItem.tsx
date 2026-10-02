import { memo, type ReactNode } from "react";
import { motion } from "motion/react";
import type { Message } from "@/types";
import { AgentMessage } from "./AgentMessage/AgentMessage";
import { rise } from "./rise";
import { SentAttachments } from "./SentAttachments/SentAttachments";

/**
 * A new message rises in; a new agent reply settles block by block, a beat apart. Messages already on screen
 * never replay it. Memoized because opening the side panel re-renders the transcript, and re-rendering every
 * message (preview mocks included) on that frame cost the panel its first frames of motion.
 */
export const MessageItem = memo(function MessageItem({
  message,
  animate,
  footer,
  streaming = false,
}: {
  message: Message;
  animate: boolean;
  footer?: ReactNode;
  streaming?: boolean;
}) {
  return (
    <motion.div initial={animate ? "hidden" : false} animate="shown">
      {message.role === "user" ? (
        <motion.div variants={rise} custom={0} className="flex flex-col items-end">
          {message.attachments && <SentAttachments items={message.attachments} />}
          <div className="max-w-[85%] rounded-2xl border border-seam bg-raised px-4 py-3 text-[15px] leading-[1.6] break-words whitespace-pre-wrap text-ink shadow-button [text-wrap:pretty]">
            {message.text}
          </div>
        </motion.div>
      ) : (
        <AgentMessage blocks={message.blocks} footer={footer} streaming={streaming} />
      )}
    </motion.div>
  );
});
