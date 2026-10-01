import { AnimatePresence, motion } from "motion/react";
import type { Agent, Subagent } from "@/types";
import { agentLabel } from "@/lib/agentKinds";
import { fadeIn } from "@/lib/motion";
import { taskClock } from "@/lib/clock";
import { plural } from "@/lib/utils";
import { ReturnedResult } from "./ReturnedResult/ReturnedResult";
import { Timeline } from "./Timeline/Timeline";

/** The main agent's view of its helpers: when each one ran, and what came back. */
export function MainOverview({
  agent,
  subs,
  onOpen,
}: {
  agent: Agent;
  subs: Subagent[];
  onOpen: (id: string) => void;
}) {
  const returned = subs.filter((s) => s.result);

  return (
    <div className="px-6 py-5">
      <h3 className="text-[16px] font-semibold text-ink">
        {agentLabel(agent)} delegated part of this task
      </h3>
      <p className="mt-1 text-[13.5px] text-ink-3">
        {plural(subs.length, "subagent")}, each with a fresh context and its own brief
      </p>

      <Timeline subs={subs} now={taskClock(agent)} onPick={onOpen} />

      <h4 className="mt-7 text-[13.5px] font-medium text-ink-2">What came back</h4>
      {/* A subagent finishing while you watch slides its result in; what was already back stays put. */}
      <ul className="mt-2 flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {returned.map((s) => (
            <motion.li
              key={s.id}
              layout="position"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={fadeIn}
            >
              <ReturnedResult sub={s} onOpen={() => onOpen(s.id)} />
            </motion.li>
          ))}
        </AnimatePresence>
        {returned.length === 0 && (
          <li className="text-[13.5px] text-ink-3">Nothing has come back yet.</li>
        )}
      </ul>
    </div>
  );
}
