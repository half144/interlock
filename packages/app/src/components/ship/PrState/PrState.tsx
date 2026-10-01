import { GitMerge, GitPullRequest, GitPullRequestDraft } from "lucide-react";
import type { PullRequestView } from "@/lib/pullRequest";
import { cn } from "@/lib/utils";

function toneOf(pr: PullRequestView) {
  if (pr.phase === "merged") return { label: "Merged", icon: GitMerge, tone: "text-merge" };
  if (pr.conflicting) return { label: "Has conflicts", icon: GitPullRequest, tone: "text-hold" };
  if (pr.draft) return { label: "Draft", icon: GitPullRequestDraft, tone: "text-ink-3" };
  return { label: "Open", icon: GitPullRequest, tone: "text-green" };
}

/** Where a pull request stands: open, draft, in conflict, or merged. */
export function PrState({ pr }: { pr: PullRequestView }) {
  const { label, icon: Icon, tone } = toneOf(pr);
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[13px] font-medium", tone)}>
      <Icon className="size-3.5" />
      {label}
    </span>
  );
}
