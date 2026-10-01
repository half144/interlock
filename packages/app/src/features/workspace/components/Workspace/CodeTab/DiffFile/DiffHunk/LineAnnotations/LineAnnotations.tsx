import type { Anchored } from "@/features/workspace/utils/comments";
import { CommentComposer } from "./CommentComposer/CommentComposer";
import { CommentThread } from "./CommentThread/CommentThread";
import { useLineAnnotations } from "./useLineAnnotations";

interface LineAnnotationsProps {
  agentId: string;
  /** The lines of the row that can take a note (two for a split row). */
  anchors: Anchored[];
}

/** The notes under a diff line (or a split row's pair of lines), and the composer if one of them is open. */
export function LineAnnotations({ agentId, anchors }: LineAnnotationsProps) {
  const { thread, open, submit, cancel, remove } = useLineAnnotations(agentId, anchors);
  if (!thread.length && !open) return null;

  return (
    <div className="sticky left-0 max-w-[560px] px-3 py-2 font-sans">
      <div className="flex flex-col gap-3 rounded-md border border-seam-2 bg-raised p-3">
        {thread.length > 0 && <CommentThread comments={thread} onRemove={remove} />}
        {open && <CommentComposer onSubmit={submit} onCancel={cancel} />}
      </div>
    </div>
  );
}
