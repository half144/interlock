import { FileSearch } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { surface } from "@/lib/styles";
import { cn } from "@/lib/utils";

interface NoChangesProps {
  headcode: string;
  onAsk: () => void;
}

export function NoChanges({ headcode, onAsk }: NoChangesProps) {
  return (
    <div className={cn(surface.frame, "h-full")}>
      <EmptyState
        icon={FileSearch}
        title="No changes yet"
        description={`${headcode} hasn’t written to its worktree yet. Changes show up here as soon as it edits a file.`}
        action={{ label: "Ask the agent for a status update", onClick: onAsk }}
      />
    </div>
  );
}
