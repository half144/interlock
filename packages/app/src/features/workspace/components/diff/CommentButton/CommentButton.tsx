import { Plus } from "lucide-react";

export function CommentButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Comment on this line"
      onClick={onClick}
      className="absolute top-0.5 left-1 z-10 hidden size-4 items-center justify-center rounded-[3px] bg-ink text-ground group-hover:flex focus-visible:flex"
    >
      <Plus className="size-3" strokeWidth={3} />
    </button>
  );
}
