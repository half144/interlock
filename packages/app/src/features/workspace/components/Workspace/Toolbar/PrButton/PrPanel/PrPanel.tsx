import { ChevronDown, GitBranch } from "lucide-react";
import type { Agent } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button/Button";
import { monoText } from "@/lib/styles";
import { Toggle } from "@/components/ui/Toggle/Toggle";

const reviewers = [
  { initials: "MR", name: "Maya R." },
  { initials: "JS", name: "Jon S." },
];

interface PrPanelProps {
  agent: Agent;
  prNumber?: number | undefined;
  draft: boolean;
  onDraft: (draft: boolean) => void;
  onOpen: () => void;
}

/** Base, reviewers and draft, then the button that opens the PR. */
export function PrPanel({ agent, prNumber, draft, onDraft, onOpen }: PrPanelProps) {
  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-medium text-ink">Pull request</span>
        <span className="flex items-center gap-1.5 text-[12.5px] text-ink-3">
          <span className={cn("size-1.5 rounded-full", prNumber ? "bg-green" : "bg-ink-4")} />
          {prNumber ? "Open" : "Not opened"}
        </span>
      </div>

      <p className="mt-3.5 text-[12.5px] text-ink-3">Base</p>
      <button
        type="button"
        className="mt-1.5 flex h-9 w-full items-center gap-2 rounded-lg bg-inset px-3 text-[13px] text-ink hover:bg-selected"
      >
        <GitBranch className="size-3.5 text-ink-3" />
        <span className={monoText}>{agent.base}</span>
        <span className="truncate text-ink-3">← {agent.branch}</span>
        <ChevronDown className="ml-auto size-3.5 shrink-0 text-ink-3" />
      </button>

      <p className="mt-3.5 text-[12.5px] text-ink-3">Reviewers</p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {reviewers.map((r) => (
          <span
            key={r.name}
            className="inline-flex h-7 items-center gap-1.5 rounded-full border border-seam py-px pr-2.5 pl-1 text-[12.5px] text-ink"
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-selected text-[10px] font-semibold text-ink-2">
              {r.initials}
            </span>
            {r.name}
          </span>
        ))}
      </div>

      <div className="mt-3.5 flex items-center justify-between">
        <span className="text-[13px] text-ink">Open as draft</span>
        <Toggle checked={draft} onChange={onDraft} label="Open as draft" />
      </div>

      <Button
        variant="primary"
        className="mt-4 w-full"
        disabled={Boolean(prNumber)}
        onClick={onOpen}
      >
        {prNumber
          ? "Pull request is open"
          : draft
            ? "Open draft pull request"
            : "Open pull request"}
      </Button>
    </>
  );
}
