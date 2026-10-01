import { motion } from "motion/react";
import type { Block } from "@/types";
import { useStore } from "@/stores/app-store";
import { Wordmark } from "@/components/ui/Wordmark/Wordmark";
import { CheckpointCard } from "@/features/thread/components/ThreadView/Transcript/MessageItem/AgentMessage/CheckpointCard/CheckpointCard";
import { DelegateCard } from "@/features/thread/components/ThreadView/Transcript/MessageItem/AgentMessage/DelegateCard/DelegateCard";
import { Followups } from "@/features/thread/components/ThreadView/Transcript/MessageItem/AgentMessage/Followups/Followups";
import { HoldCard } from "@/features/thread/components/ThreadView/Transcript/MessageItem/AgentMessage/HoldCard/HoldCard";
import { Prose } from "@/features/thread/components/blocks/Prose/Prose";
import { StepItem } from "@/features/thread/components/ThreadView/Transcript/MessageItem/AgentMessage/StepItem/StepItem";
import { liveSteps, type Step } from "@/features/thread/utils/planSteps";
import { rise } from "@/features/thread/utils/rise";

/** An agent reply: its blocks in order, with plan steps following the agent's live progress. */
export function AgentMessage({
  blocks,
  agentId,
}: {
  blocks: Block[];
  agentId?: string | undefined;
}) {
  const agent = useStore((s) => (agentId ? s.agents[agentId] : undefined));
  const steps = blocks.filter((b): b is Step => b.type === "step");
  const statuses = agent ? liveSteps(agent, steps) : steps.map((s) => s.status);
  let stepIndex = 0;

  return (
    <div>
      <motion.div variants={rise} custom={0}>
        <Wordmark className="mb-2.5 [&>span]:text-[16px]" />
      </motion.div>
      <div className="flex flex-col gap-3">
        {blocks.map((block, i) => (
          <motion.div key={i} variants={rise} custom={i + 1}>
            {renderBlock(block, block.type === "step" ? statuses[stepIndex++] : undefined)}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function renderBlock(block: Block, status?: Step["status"]) {
  switch (block.type) {
    case "text":
      return <Prose text={block.text} />;
    case "step":
      return <StepItem {...block} status={status ?? block.status} />;
    case "hold":
      return (
        <div className="mt-1">
          <HoldCard agentId={block.agentId} />
        </div>
      );
    case "delegate":
      return <DelegateCard agentId={block.agentId} subagentIds={block.subagentIds} />;
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
