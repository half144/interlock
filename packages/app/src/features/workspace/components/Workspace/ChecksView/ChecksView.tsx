import { ListChecks } from "lucide-react";
import type { Agent } from "@/types";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { CheckRow } from "./CheckRow/CheckRow";
import { ChecksBlocked } from "./ChecksBlocked/ChecksBlocked";
import { ChecksHeader } from "./ChecksHeader/ChecksHeader";
import { useChecksView } from "./useChecksView";

/** The pull request's checks, from `gh`: name, how each ended, how long it took, and a link to its run. */
export function ChecksView({ agent }: { agent: Agent }) {
  const { pr, blocker } = useChecksView(agent);

  if (pr.phase === "none") {
    return blocker ? (
      <ChecksBlocked note={blocker} />
    ) : (
      <EmptyState
        icon={ListChecks}
        title="No pull request yet"
        description="Checks show up here once the task has a pull request."
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <ChecksHeader agent={agent} title={pr.title} url={pr.url} />
      {pr.checks.length > 0 ? (
        <ul className="min-h-0 flex-1 overflow-y-auto">
          {pr.checks.map((check) => (
            <CheckRow key={check.id} check={check} />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={ListChecks}
          title="No checks reported"
          description="GitHub has not started any checks for this pull request. They appear here as soon as it does."
        />
      )}
    </div>
  );
}
