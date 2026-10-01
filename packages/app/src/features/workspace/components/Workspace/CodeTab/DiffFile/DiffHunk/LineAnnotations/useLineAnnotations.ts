import { useStore } from "@/stores/app-store";
import { commentsAt, type Anchored } from "@/features/workspace/utils/comments";

const NO_COMMENTS: never[] = [];

export function useLineAnnotations(agentId: string, anchors: Anchored[]) {
  const comments = useStore((s) => s.reviewComments[agentId]) ?? NO_COMMENTS;
  const composer = useStore((s) => s.reviewComposer);
  const add = useStore((s) => s.addReviewComment);
  const remove = useStore((s) => s.removeReviewComment);
  const compose = useStore((s) => s.setReviewComposer);

  const keys = anchors.map((anchor) => anchor.key);
  const open = anchors.find((anchor) => anchor.key === composer);

  return {
    thread: commentsAt(comments, keys),
    open: open !== undefined,
    submit: (text: string) => open && add(agentId, { ...open.draft, text }),
    cancel: () => compose(null),
    remove: (id: string) => remove(agentId, id),
  };
}
