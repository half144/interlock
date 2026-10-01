import { GitPullRequest } from "lucide-react";
import type { PullRequestView } from "@/lib/pullRequest";
import { Button } from "@/components/ui/Button/Button";
import { ChecksDot } from "@/components/ship/ChecksDot/ChecksDot";

interface OpenPrButtonProps {
  pr: PullRequestView;
  onClick: () => void;
}

/** The PR is open: its number, with a dot for how its checks stand. */
export function OpenPrButton({ pr, onClick }: OpenPrButtonProps) {
  return (
    <Button size="sm" icon={<GitPullRequest />} onClick={onClick} title={pr.summary.label}>
      {pr.number ? `PR #${pr.number}` : "Pull request"}
      <ChecksDot state={pr.summary.state} />
    </Button>
  );
}
