import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Block } from "@/types";
import { Wordmark } from "@/components/ui/Wordmark/Wordmark";
import { CheckpointCard } from "@/features/thread/components/ThreadView/Transcript/MessageItem/AgentMessage/CheckpointCard/CheckpointCard";
import { DelegateCard } from "@/features/thread/components/ThreadView/Transcript/MessageItem/AgentMessage/DelegateCard/DelegateCard";
import { Followups } from "@/features/thread/components/ThreadView/Transcript/MessageItem/AgentMessage/Followups/Followups";
import { HoldCard } from "@/features/thread/components/ThreadView/Transcript/MessageItem/AgentMessage/HoldCard/HoldCard";
import { CopyButton } from "@/features/thread/components/blocks/CopyButton/CopyButton";
import { Markdown } from "@/features/thread/components/blocks/Markdown/Markdown";
import { NoticeLine } from "@/features/thread/components/blocks/NoticeLine/NoticeLine";
import { ReasoningBlock } from "@/features/thread/components/blocks/ReasoningBlock/ReasoningBlock";
import { ToolCalls } from "@/features/thread/components/blocks/ToolCalls/ToolCalls";
import { StepItem } from "@/features/thread/components/ThreadView/Transcript/MessageItem/AgentMessage/StepItem/StepItem";
import { keyBlocks, replyText } from "@/features/thread/utils/blocks";
import { joinAnimate, joinInitial, leave, rise } from "../rise";
import { useAgentMessage } from "./useAgentMessage";

/**
 * `footer` closes the reply, under its last block: what the agent is doing while the turn runs.
 * `streaming` is a reply still being written: its last text block fades its words in.
 */
export function AgentMessage({
  blocks,
  footer,
  streaming = false,
}: {
  blocks: Block[];
  footer?: ReactNode;
  streaming?: boolean;
}) {
  const { arrived } = useAgentMessage(blocks);
  const lastText = blocks.findLastIndex((b) => b.type === "text");
  const text = replyText(blocks);
  return (
    <div className="group/reply">
      <motion.div variants={rise} custom={0} className="mb-2.5 flex items-center justify-between">
        <Wordmark className="[&>span]:text-[16px]" />
        {text && !streaming && (
          <CopyButton
            text={text}
            label="Copy reply"
            className="-my-1 opacity-0 transition-opacity duration-150 group-hover/reply:opacity-100 focus-visible:opacity-100"
          />
        )}
      </motion.div>
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {keyBlocks(blocks).map(({ block, key, position }) => {
            const content = renderBlock(block, streaming && position === lastText);
            if (position < arrived)
              return (
                <motion.div key={key} variants={rise} custom={position + 1} exit={leave}>
                  {content}
                </motion.div>
              );
            if (block.type === "text") return <div key={key}>{content}</div>;
            return (
              <motion.div key={key} initial={joinInitial} animate={joinAnimate} exit={leave}>
                {content}
              </motion.div>
            );
          })}
          {footer}
        </AnimatePresence>
      </div>
    </div>
  );
}

function renderBlock(block: Block, streaming: boolean) {
  switch (block.type) {
    case "text":
      return <Markdown text={block.text} streaming={streaming} />;
    case "reasoning":
      return <ReasoningBlock text={block.text} />;
    case "tools":
      return <ToolCalls chips={block.tools} />;
    case "notice":
      return <NoticeLine level={block.level} text={block.text} />;
    case "step":
      return <StepItem {...block} />;
    case "hold":
      return (
        <div className="mt-1">
          <HoldCard agentId={block.agentId} />
        </div>
      );
    case "delegate":
      return <DelegateCard agentId={block.agentId} toolCallIds={block.toolCallIds} />;
    case "changes":
      return <CheckpointCard agentId={block.agentId} />;
    case "followups":
      return (
        <div className="mt-2">
          <Followups items={block.items} />
        </div>
      );
  }
}
