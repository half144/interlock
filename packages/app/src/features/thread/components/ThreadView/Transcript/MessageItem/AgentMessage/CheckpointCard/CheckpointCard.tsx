import { cn, plural } from "@/lib/utils";
import { Button } from "@/components/ui/Button/Button";
import { DiffStat } from "@/components/ui/DiffStat/DiffStat";
import { PrButton } from "@/components/ship/PrButton/PrButton";
import { surface } from "@/lib/styles";
import { useCheckpointCard } from "./useCheckpointCard";

function prLabel(phase: "none" | "open" | "merged", number: number | null) {
  if (phase === "none") return "PR not opened";
  const label = number === null ? "" : ` #${number}`;
  return phase === "merged" ? `Merged${label}` : `PR${label} open`;
}

export function CheckpointCard({ agentId }: { agentId: string }) {
  const { agent, title, files, phase, prNumber, updated, viewChanges } = useCheckpointCard(agentId);
  if (!agent) return null;

  const meta = [
    { key: "pr", node: prLabel(phase, prNumber) },
    {
      key: "files",
      node: (
        <>
          {plural(files, "file")}
          <DiffStat className="ml-1.5" additions={agent.additions} deletions={agent.deletions} />
        </>
      ),
    },
    { key: "updated", node: updated === "now" ? "just now" : `${updated} ago` },
  ];

  return (
    <div className={cn(surface.card, "@container w-full overflow-hidden")}>
      <div className="grid grid-cols-[minmax(0,1fr)] items-center gap-x-3 gap-y-2.5 p-3.5 @[380px]:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0 overflow-hidden">
          <p className="truncate text-[14.5px] font-medium text-ink">{title}</p>
          {/* Each item leads with its own dot; the -ml-4 pushes the first dot of every wrapped line past the clipped edge, so no line starts or ends on a separator. */}
          <p className="-ml-4 flex flex-wrap items-center text-[12.5px] text-ink-3">
            {meta.map(({ key, node }) => (
              <span
                key={key}
                className="whitespace-nowrap before:inline-block before:w-4 before:text-center before:content-['·']"
              >
                {node}
              </span>
            ))}
          </p>
        </div>
        <span className="flex items-center gap-2 justify-self-start @[380px]:justify-self-end">
          <Button size="sm" onClick={viewChanges}>
            View changes
          </Button>
          <PrButton agent={agent} />
        </span>
      </div>
    </div>
  );
}
