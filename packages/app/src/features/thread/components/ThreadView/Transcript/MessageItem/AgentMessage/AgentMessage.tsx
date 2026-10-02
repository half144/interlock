import type { ReactNode } from "react";
import { motion } from "motion/react";
import type { Block } from "@/types";
import { Wordmark } from "@/components/ui/Wordmark/Wordmark";
import { CheckpointCard } from "@/features/thread/components/ThreadView/Transcript/MessageItem/AgentMessage/CheckpointCard/CheckpointCard";
import { DelegateCard } from "@/features/thread/components/ThreadView/Transcript/MessageItem/AgentMessage/DelegateCard/DelegateCard";
import { Followups } from "@/features/thread/components/ThreadView/Transcript/MessageItem/AgentMessage/Followups/Followups";
import { HoldCard } from "@/features/thread/components/ThreadView/Transcript/MessageItem/AgentMessage/HoldCard/HoldCard";
import { Markdown } from "@/features/thread/components/blocks/Markdown/Markdown";
import { NoticeLine } from "@/features/thread/components/blocks/NoticeLine/NoticeLine";
import { ReasoningBlock } from "@/features/thread/components/blocks/ReasoningBlock/ReasoningBlock";
import { ToolCalls } from "@/features/thread/components/blocks/ToolCalls/ToolCalls";
import { StepItem } from "@/features/thread/components/ThreadView/Transcript/MessageItem/AgentMessage/StepItem/StepItem";
import { keyBlocks } from "@/features/thread/utils/blocks";
import { rise } from "../rise";

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
  const lastText = blocks.findLastIndex((b) => b.type === "text");
  return (
    <div>
      <motion.div variants={rise} custom={0}>
        <Wordmark className="mb-2.5 [&>span]:text-[16px]" />
      </motion.div>
      <div className="flex flex-col gap-3">
        {keyBlocks(blocks).map(({ block, key, position }) => (
          <motion.div key={key} variants={rise} custom={position + 1}>
            {renderBlock(block, streaming && position === lastText)}
          </motion.div>
        ))}
        {footer}
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
