import { AnimatePresence, motion } from "motion/react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { fadeIn, fadeOut } from "@/lib/motion";
import { cn, plural } from "@/lib/utils";
import { surface } from "@/lib/styles";
import { useReviewBar } from "./useReviewBar";

/** The notes left on the diff wait here, and go to the agent together as one follow-up. */
export function ReviewBar({ agentId }: { agentId: string }) {
  const { count, sending, send, discard } = useReviewBar(agentId);

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0, transition: fadeIn }}
          exit={{ opacity: 0, y: 8, transition: fadeOut }}
          className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center"
        >
          <div
            className={cn(
              surface.overlay,
              "pointer-events-auto flex items-center gap-2 rounded-xl p-1.5 pl-3.5",
            )}
          >
            <span className="text-[13px] text-ink-2">{plural(count, "comment")}</span>
            <Button size="sm" variant="ghost" onClick={discard} disabled={sending}>
              Discard
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Send />}
              onClick={() => void send()}
              disabled={sending}
            >
              Send {plural(count, "comment")} to agent
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
