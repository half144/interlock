import type { Agent } from "@/types";
import { plural } from "@/lib/utils";
import { DiffStat } from "@/components/ui/DiffStat/DiffStat";
import { Lamp } from "@/components/ui/Lamp/Lamp";
import { useWaitingOnYou } from "./useWaitingOnYou";

/**
 * The tasks blocked on you, across every project, like Codex's review queue: the sidebar lists everything by
 * recency, this lists only what waits for a decision. When nothing does, it says so instead of inventing work.
 */
export function WaitingOnYou() {
  const { waiting, working, projectName, open } = useWaitingOnYou();

  return (
    <section className="mt-12">
      <h2 className="placard flex items-center gap-2 px-3">
        Waiting on you
        {waiting.length > 0 && <span className="text-ink-4 tabular-nums">{waiting.length}</span>}
      </h2>
      {waiting.length ? (
        <ul className="mt-2">
          {waiting.map((agent) => (
            <li key={agent.id}>
              <button
                type="button"
                onClick={() => open(agent.threadId)}
                className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors hover:bg-hover"
              >
                <Lamp aspect={agent.aspect} />
                <span className="min-w-0 flex-1 truncate text-[14px] text-ink">
                  {agent.hold?.title ?? agent.title}
                </span>
                <Detail agent={agent} />
                <span className="w-24 shrink-0 truncate text-right text-[12.5px] text-ink-4">
                  {projectName(agent.projectId)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 px-3 text-[13.5px] text-ink-3">
          Nothing needs you right now
          {working > 0 && ` · ${plural(working, "agent is", "agents are")} working`}.
        </p>
      )}
    </section>
  );
}

function Detail({ agent }: { agent: Agent }) {
  if (agent.aspect === "review")
    return (
      <DiffStat
        additions={agent.additions}
        deletions={agent.deletions}
        className="shrink-0 text-[12px]"
      />
    );
  return (
    <span className="max-w-[40%] shrink-0 truncate text-[12.5px] text-ink-3">
      {agent.aspect === "held" ? agent.title : agent.step}
    </span>
  );
}
