import type { Agent, Block, Thread } from "@/types";

export type Step = Extract<Block, { type: "step" }>;

/** The plan of the turn on screen. A new prompt starts without one, so an earlier turn's plan never reads as progress. */
export function turnPlan(thread: Thread): Step[] {
  const last = thread.messages.at(-1);
  if (last?.role !== "agent") return [];
  return last.blocks.filter((b): b is Step => b.type === "step");
}

/** Where the agent stands in its plan: every step's status, how many are done, and the one it's on. */
export function planProgress(agent: Agent, thread: Thread) {
  const steps = turnPlan(thread);
  const statuses = steps.map((s) => s.status);
  const done = statuses.filter((s) => s === "completed").length;
  const index =
    done === steps.length
      ? steps.length - 1
      : Math.max(
          0,
          statuses.findIndex((s) => s !== "completed"),
        );
  const current = steps[index];
  // Claude names the item it's on in the present tense, like its spinner does; Codex only gives the item.
  const headline =
    agent.aspect === "running" && statuses[index] === "in_progress"
      ? (current?.activeForm ?? current?.text)
      : current?.text;
  return { steps, statuses, done, index, current, headline };
}
