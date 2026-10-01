import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { useStore } from "@/stores/app-store";
import { fadeIn, fadeOut, spring } from "@/lib/motion";
import { HoldQuestion } from "./HoldQuestion/HoldQuestion";

/** The agent is paused until you answer. Once you do, the card folds away into a one-line receipt. */
export function HoldCard({ agentId }: { agentId: string }) {
  const hold = useStore((s) => s.agents[agentId]?.hold);

  return (
    <AnimatePresence initial={false}>
      {hold ? (
        <motion.div
          key="ask"
          exit={{ height: 0, opacity: 0, transition: { height: spring, opacity: fadeOut } }}
          style={{ overflow: "hidden" }}
        >
          <HoldQuestion agentId={agentId} hold={hold} />
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
