import { reviewMessage } from "@/lib/reviewMessage";
import type { ReviewComment, Thread } from "@/types";
import type { SliceCreator } from "../types";

export interface ReviewSlice {
  /** Notes left on diff lines, waiting to go to the agent as one follow-up, by agent id. */
  reviewComments: Record<string, ReviewComment[]>;
  /** The diff line whose comment box is open. */
  reviewComposer: string | null;

  setReviewComposer: (key: string | null) => void;
  addReviewComment: (agentId: string, comment: Omit<ReviewComment, "id">) => void;
  removeReviewComment: (agentId: string, id: string) => void;
  clearReviewComments: (agentId: string) => void;
  /** Sends every waiting note as one message and clears them; a send that fails keeps them. */
  sendReview: (agentId: string) => Promise<void>;
}

const wasSent = (thread: Thread | undefined, text: string) =>
  thread?.messages.some((m) => m.role === "user" && m.text === text) ?? false;

export const createReviewSlice: SliceCreator<ReviewSlice> = (set, get) => ({
  reviewComments: {},
  reviewComposer: null,

  setReviewComposer: (reviewComposer) => set({ reviewComposer }),

  addReviewComment: (agentId, comment) =>
    set((s) => ({
      reviewComments: {
        ...s.reviewComments,
        [agentId]: [...(s.reviewComments[agentId] ?? []), { ...comment, id: crypto.randomUUID() }],
      },
      reviewComposer: null,
    })),

  removeReviewComment: (agentId, id) =>
    set((s) => ({
      reviewComments: {
        ...s.reviewComments,
        [agentId]: (s.reviewComments[agentId] ?? []).filter((c) => c.id !== id),
      },
    })),

  clearReviewComments: (agentId) =>
    set((s) => ({ reviewComments: { ...s.reviewComments, [agentId]: [] } })),

  sendReview: async (agentId) => {
    const comments = get().reviewComments[agentId] ?? [];
    if (!comments.length) return;
    const text = reviewMessage(comments);
    get().clearReviewComments(agentId);
    await get().sendMessage(agentId, text, []);
    if (wasSent(get().threads[agentId], text)) return;
    set((s) => ({
      reviewComments: {
        ...s.reviewComments,
        [agentId]: [...comments, ...(s.reviewComments[agentId] ?? [])],
      },
    }));
  },
});
