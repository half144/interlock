import type { Agent, Block, Thread } from "@/types";

export type Step = Extract<Block, { type: "step" }>;

function latestSteps(thread: Thread): Step[] {
  for (let i = thread.messages.length - 1; i >= 0; i--) {
    const m = thread.messages[i];
    if (m?.role !== "agent") continue;
    const steps = m.blocks.filter((b): b is Step => b.type === "step");
    if (steps.length) return steps;
  }
  return [];
}

/** Where the agent stands in its latest plan: every step's status, how many are done, and the one it's on. */
export function planProgress(agent: Agent, thread: Thread) {
  const steps = latestSteps(thread);
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
