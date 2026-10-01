import { GitPullRequest } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";

/** The task has no pull request yet: the one primary action of the workspace toolbar. */
export function CreatePrButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="relative">
      <Button size="sm" variant="primary" icon={<GitPullRequest />} onClick={onClick}>
        Create PR
      </Button>
      <span
        aria-hidden
        className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-run ring-2 ring-raised"
      />
    </div>
  );
}
