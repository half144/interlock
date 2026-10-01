import { Globe, Server } from "lucide-react";
import { diffs } from "@/mocks/diffs";
import { isApiProject } from "@/mocks/projects";
import { useStore } from "@/stores/app-store";
import { cn, ago, plural } from "@/lib/utils";
import { Button } from "@/components/ui/Button/Button";
import { ScaledFrame } from "@/components/ui/ScaledFrame/ScaledFrame";
import { surface } from "@/lib/styles";
import { DiffStat } from "@/components/ui/DiffStat/DiffStat";
import { ApiMock } from "@/components/preview/api/ApiMock/ApiMock";
import { WorktreeMock } from "@/components/preview/WorktreeMock/WorktreeMock";

/** A saved checkpoint of the agent's work: what changed, a live look at the app, and the way to ship it. */
export function CheckpointCard({ agentId }: { agentId: string }) {
  const agent = useStore((s) => s.agents[agentId]);
  const thread = useStore((s) => (agent ? s.threads[agent.threadId] : undefined));
  const openPanel = useStore((s) => s.openPanel);
  if (!agent || !thread) return null;
  const files = diffs[agentId]?.length ?? agent.files.length;
  const isApi = isApiProject(agent.projectId);
  const merged = agent.aspect === "merged";
  const Icon = isApi ? Server : Globe;
  const updated = ago(thread.updatedMin);
  const meta = [
    merged ? `Merged as #${agent.pr}` : "PR not opened",
    <>
      {plural(files, "file")}
      <DiffStat className="ml-1.5" additions={agent.additions} deletions={agent.deletions} />
    </>,
    updated === "now" ? "just now" : `${updated} ago`,
  ];

  return (
    <div className={cn(surface.card, "@container w-full overflow-hidden")}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2.5 p-3.5 @[380px]:grid-cols-[auto_minmax(0,1fr)_auto]">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-run/15 text-run">
          <Icon className="size-[18px]" />
        </span>
        <div className="min-w-0 overflow-hidden">
          <p className="truncate text-[14.5px] font-medium text-ink">{thread.title}</p>
          {/* Each item leads with its own dot; the -ml-4 pushes the first dot of every wrapped line past the clipped edge, so no line starts or ends on a separator. */}
          <p className="-ml-4 flex flex-wrap items-center text-[12.5px] text-ink-3">
            {meta.map((item, i) => (
              <span
                key={i}
                className="whitespace-nowrap before:inline-block before:w-4 before:text-center before:content-['·']"
              >
                {item}
              </span>
            ))}
          </p>
        </div>
        <span className="relative col-start-2 justify-self-start @[380px]:col-start-3">
          {merged ? (
            <Button size="sm" onClick={() => openPanel("diff")}>
              View changes
            </Button>
          ) : (
            <>
              <Button size="sm" variant="primary" onClick={() => openPanel("diff")}>
                Create PR
              </Button>
              <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full border-2 border-raised bg-run" />
            </>
          )}
        </span>
      </div>
      <button
        type="button"
        onClick={() => openPanel("preview")}
        aria-label="Open preview"
        className="group block w-full border-t border-seam bg-inset px-3.5 pt-3.5 text-left"
      >
        <div className="pointer-events-none max-h-[230px] overflow-hidden rounded-t-lg border border-b-0 border-seam bg-white shadow-card transition-transform duration-200 ease-out-quint group-hover:-translate-y-0.5">
          {isApi ? (
            <ScaledFrame width={760}>
              <ApiMock agent={agent} />
            </ScaledFrame>
          ) : (
            <WorktreeMock projectId={agent.projectId} />
          )}
        </div>
      </button>
    </div>
  );
}
