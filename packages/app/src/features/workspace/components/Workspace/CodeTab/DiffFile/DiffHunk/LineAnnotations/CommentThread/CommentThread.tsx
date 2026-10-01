import type { ReviewComment } from "@/features/workspace/hooks/useReviewComments";

export function CommentThread({ comments }: { comments: ReviewComment[] }) {
  return (
    <div className="flex flex-col gap-3">
      {comments.map((c) => (
        <div key={c.id} className="flex gap-2.5">
          <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-selected text-[10px] font-semibold text-ink-2">
            Y
          </span>
          <div className="min-w-0">
            <div className="text-[12px] font-medium text-ink-2">You</div>
            <p className="mt-0.5 text-[13px] leading-[1.5] whitespace-normal text-ink">{c.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
