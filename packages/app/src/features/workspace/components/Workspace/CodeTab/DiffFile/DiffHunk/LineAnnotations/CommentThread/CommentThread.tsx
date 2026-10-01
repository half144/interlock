import { X } from "lucide-react";
import type { ReviewComment } from "@/types";
import { IconButton } from "@/components/ui/IconButton/IconButton";

interface CommentThreadProps {
  comments: ReviewComment[];
  onRemove: (id: string) => void;
}

/** The notes waiting to go to the agent. Each can still be taken back. */
export function CommentThread({ comments, onRemove }: CommentThreadProps) {
  return (
    <div className="flex flex-col gap-3">
      {comments.map((c) => (
        <div key={c.id} className="group flex gap-2.5">
          <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-selected text-[10px] font-semibold text-ink-2">
            Y
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[12px] font-medium text-ink-2">You</div>
            <p className="mt-0.5 text-[13px] leading-[1.5] whitespace-normal text-ink">{c.text}</p>
          </div>
          <IconButton
            label="Remove comment"
            onClick={() => onRemove(c.id)}
            className="size-6 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
          >
            <X />
          </IconButton>
        </div>
      ))}
    </div>
  );
}
