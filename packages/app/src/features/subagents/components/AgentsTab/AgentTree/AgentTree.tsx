import { useId } from "react";
import { LayoutGroup, motion } from "motion/react";
import type { Agent, Subagent } from "@/types";
import { MainAgentRow } from "./MainAgentRow/MainAgentRow";
import { SubagentRow } from "./SubagentRow/SubagentRow";

/** The main agent on top and its subagents hanging beneath it; picking one opens its chat. */
export function AgentTree({
  agent,
  subs,
  current,
  onSelect,
}: {
  agent: Agent;
  subs: Subagent[];
  current?: Subagent | undefined;
  onSelect: (id: string | null) => void;
}) {
  const group = useId();

  return (
    <LayoutGroup id={group}>
      <motion.nav
        layoutScroll
        aria-label="Agents on this task"
        className="flex w-[232px] shrink-0 flex-col overflow-y-auto border-r border-seam py-2"
      >
        <p className="px-4 pt-1 pb-2 text-[12.5px] text-ink-3">Agents on this task</p>
        <MainAgentRow agent={agent} selected={!current} onSelect={() => onSelect(null)} />
        <ul className="relative mt-1 ml-[30px] border-l border-seam pr-2 pl-2">
          {subs.map((s) => (
            <SubagentRow
              key={s.id}
              sub={s}
              agent={agent}
              selected={current?.id === s.id}
              onSelect={() => onSelect(s.id)}
            />
          ))}
        </ul>
      </motion.nav>
    </LayoutGroup>
  );
}
