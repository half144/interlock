import { GitMerge } from "lucide-react";
import type { PullRequestView } from "@/lib/pullRequest";
import { Button } from "@/components/ui/Button/Button";

interface MergedPrButtonProps {
  pr: PullRequestView;
  onClick: () => void;
}

export function MergedPrButton({ pr, onClick }: MergedPrButtonProps) {
  return (
    <Button
      size="sm"
      icon={<GitMerge className="text-merge" />}
      onClick={onClick}
      title="This pull request was merged"
    >
      {pr.number ? `Merged #${pr.number}` : "Merged"}
    </Button>
  );
}
