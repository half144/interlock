import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import type { Hold } from "@/types";
import { fadeIn, fadeOut, spring } from "@/lib/motion";
import { ApprovalHold } from "./ApprovalHold/ApprovalHold";
import { PlanHold } from "./PlanHold/PlanHold";
import { QuestionHold } from "./QuestionHold/QuestionHold";
import { useHoldCard } from "./useHoldCard";

function HoldBody({ agentId, hold }: { agentId: string; hold: Hold }) {
  if (hold.kind === "question") return <QuestionHold agentId={agentId} hold={hold} />;
  if (hold.kind === "plan") return <PlanHold agentId={agentId} hold={hold} />;
  return <ApprovalHold agentId={agentId} hold={hold} />;
}

/** The agent is paused until you answer. Once you do, the card folds away into a one-line receipt. */
export function HoldCard({ agentId }: { agentId: string }) {
  const { hold } = useHoldCard(agentId);

  return (
    <AnimatePresence initial={false}>
      {hold ? (
        <motion.div
          key="ask"
          exit={{ height: 0, opacity: 0, transition: { height: spring, opacity: fadeOut } }}
          style={{ overflow: "hidden" }}
        >
          <HoldBody agentId={agentId} hold={hold} />
        </motion.div>
      ) : (
        <motion.p
          key="answered"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0, transition: { y: spring, opacity: fadeIn } }}
          className="flex items-center gap-1.5 text-[13.5px] text-ink-3"
        >
          <Check className="size-3.5 text-green" />
          Answered
        </motion.p>
      )}
    </AnimatePresence>
  );
}
