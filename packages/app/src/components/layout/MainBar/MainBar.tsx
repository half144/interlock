import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Bell, Sparkles } from "lucide-react";
import { projects } from "@/mocks/projects";
import { useStore } from "@/stores/app-store";
import { usd } from "@/lib/utils";
import { fadeIn, fadeOut } from "@/lib/motion";
import { Pill } from "@/components/ui/Pill/Pill";
import { RoundButton } from "@/components/ui/RoundButton/RoundButton";

const DAILY_BUDGET = projects.reduce((n, p) => n + p.budget, 0);

/**
 * Top of the main area: a title or picker on the left, account controls on the right. Going compact (the side
 * panel opening) crossfades the right-hand controls instead of swapping them while the column is moving.
 */
export function MainBar({
  left,
  right,
  compact,
}: {
  left?: ReactNode;
  right?: ReactNode;
  compact?: boolean;
}) {
  const agents = useStore((s) => s.agents);
  const spend = Object.values(agents).reduce((n, a) => n + a.cost, 0);

  return (
    <header className="relative flex h-[52px] shrink-0 items-center gap-2 px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">{left}</div>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={compact ? "compact" : "full"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { ...fadeIn, delay: 0.1 } }}
          exit={{ opacity: 0, transition: fadeOut }}
          className="flex shrink-0 items-center gap-2"
        >
          {right}
          {!compact && (
            <>
              <RoundButton label="Notifications" variant="outline">
                <Bell />
              </RoundButton>
              <Pill
                as="span"
                title={`${usd(spend)} of ${usd(DAILY_BUDGET)} daily budget`}
                className="font-medium tabular-nums"
              >
                <Sparkles className="size-3.5 text-ink-2" />
                {usd(spend)}
              </Pill>
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#d9c7a7] text-[12px] font-semibold text-[#5b4a2c]">
                L
              </span>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </header>
  );
}
