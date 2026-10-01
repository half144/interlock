import type { ReviewNotes } from "@/features/workspace/hooks/useReviewComments";
import { CommentComposer } from "./CommentComposer/CommentComposer";
import { CommentThread } from "./CommentThread/CommentThread";

interface LineAnnotationsProps extends ReviewNotes {
  keys: string[];
}

/** The notes under a diff line (or a split row's pair of lines), and the composer if one of them is open. */
export function LineAnnotations({
  keys,
  comments,
  composer,
  onCompose,
  onComment,
}: LineAnnotationsProps) {
  const unique = [...new Set(keys)];
  const thread = unique.flatMap((k) => comments[k] ?? []);
  const open = unique.find((k) => k === composer);
  if (!thread.length && !open) return null;

  return (
    <div className="sticky left-0 max-w-[560px] px-3 py-2 font-sans">
      <div className="flex flex-col gap-3 rounded-md border border-seam-2 bg-raised p-3">
        {thread.length > 0 && <CommentThread comments={thread} />}
        {open && (
          <CommentComposer
            onSubmit={(text) => onComment(open, text)}
            onCancel={() => onCompose(null)}
          />
        )}
      </div>
    </div>
  );
}
