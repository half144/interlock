import { useState } from "react";
import { useStore } from "@/stores/app-store";

const NO_COMMENTS: never[] = [];

export function useReviewBar(agentId: string) {
  const count = (useStore((s) => s.reviewComments[agentId]) ?? NO_COMMENTS).length;
  const sendReview = useStore((s) => s.sendReview);
  const clear = useStore((s) => s.clearReviewComments);
  const [sending, setSending] = useState(false);

  return {
    count,
    sending,
    send: async () => {
      setSending(true);
      await sendReview(agentId);
      setSending(false);
    },
    discard: () => clear(agentId),
  };
}
