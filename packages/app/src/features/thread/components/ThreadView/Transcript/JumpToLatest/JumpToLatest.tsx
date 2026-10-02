import { AnimatePresence, motion, type MotionValue } from "motion/react";
import { ArrowDown } from "lucide-react";
import { fadeIn, fadeOut, spring } from "@/lib/motion";
import { RoundButton } from "@/components/ui/RoundButton/RoundButton";

const LIFT = 12;

/** Appears once you have scrolled well away from the latest message, and takes you back to it. */
export function JumpToLatest({
  visible,
  clearance,
  onJump,
}: {
  visible: boolean;
  clearance: MotionValue<number>;
  onJump: () => void;
}) {
  return (
    <motion.div
      style={{ bottom: clearance }}
      className="pointer-events-none absolute inset-x-0 z-20 flex justify-center pb-3"
    >
      <AnimatePresence>
        {visible && (
          <motion.span
            initial={{ opacity: 0, y: LIFT, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: { y: spring, scale: spring, opacity: fadeIn },
            }}
            exit={{ opacity: 0, y: LIFT / 2, transition: fadeOut }}
            className="pointer-events-auto"
          >
            <RoundButton
              label="Jump to latest"
              variant="outline"
              onClick={onJump}
              className="bg-panel shadow-button"
            >
              <ArrowDown />
            </RoundButton>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
