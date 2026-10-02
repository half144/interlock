import { AnimatePresence, motion } from "motion/react";
import type { Hold } from "@/types";
import { fadeOut } from "@/lib/motion";
import { ApprovalHold } from "./ApprovalHold/ApprovalHold";
import { PlanHold } from "./PlanHold/PlanHold";
import { QuestionHold } from "./QuestionHold/QuestionHold";
import { useHoldCard } from "./useHoldCard";

function HoldBody({ agentId, hold }: { agentId: string; hold: Hold }) {
  if (hold.kind === "question") return <QuestionHold agentId={agentId} hold={hold} />;
  if (hold.kind === "plan") return <PlanHold agentId={agentId} hold={hold} />;
  return <ApprovalHold agentId={agentId} hold={hold} />;
}

/** The agent is paused until you answer. The card fades while the reply folds the room it took away. */
export function HoldCard({ agentId }: { agentId: string }) {
  const { hold } = useHoldCard(agentId);

  return (
    <AnimatePresence initial={false}>
      {hold && (
        <motion.div key="ask" exit={{ opacity: 0, transition: fadeOut }}>
          <HoldBody agentId={agentId} hold={hold} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
