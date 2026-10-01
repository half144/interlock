import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { ComposerFrame } from "@/components/ui/ComposerFrame/ComposerFrame";
import { SendButton } from "@/components/ui/SendButton/SendButton";
import { useAddProject } from "./useAddProject";

export function AddProject() {
  const { error, add } = useAddProject();

  return (
    <div className="mt-8">
      <ComposerFrame>
        <p className="px-5 pt-4 pb-5 text-[15px] leading-relaxed text-ink-4">
          Choose a git repository, then give Interlock its first task
        </p>
        <div className="flex items-center gap-1.5 px-3 pb-3">
          <Button variant="primary" icon={<FolderPlus />} onClick={add}>
            Choose repository
          </Button>
          <span className="ml-auto">
            <SendButton label="Start task" disabled />
          </span>
        </div>
      </ComposerFrame>
      {error && (
        <p role="alert" className="mt-3 px-3 text-[13px] text-red">
          {error}
        </p>
      )}
      <p className="mt-4 px-3 text-center text-[13px] text-ink-3 [text-wrap:balance]">
        Every task runs in its own worktree. You review the diff, then open a pull request.
      </p>
    </div>
  );
}
