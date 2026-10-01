import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Thread } from "@/types";
import { useStore } from "../app-store";

const note = (text: string) => ({
  path: "src/a.ts",
  line: 3,
  side: "new" as const,
  snippet: "const a = 1;",
  text,
});

const threadWith = (...texts: string[]): Thread => ({
  id: "a1",
  projectId: "p",
  title: "t",
  updatedAt: 0,
  agentIds: ["a1"],
  messages: texts.map((text, i) => ({ id: `m${i}`, role: "user", text, at: 0 })),
});

describe("review slice", () => {
  beforeEach(() => useStore.setState({ reviewComments: {}, reviewComposer: null, threads: {} }));

  it("accumulates the comments of each task separately and closes the composer", () => {
    const { addReviewComment, setReviewComposer } = useStore.getState();
    setReviewComposer("k");
    addReviewComment("a1", note("one"));
    addReviewComment("a1", note("two"));
    addReviewComment("a2", note("other task"));
    const { reviewComments, reviewComposer } = useStore.getState();
    expect(reviewComments["a1"]?.map((c) => c.text)).toEqual(["one", "two"]);
    expect(reviewComments["a2"]).toHaveLength(1);
    expect(reviewComposer).toBeNull();
  });

  it("removes one comment", () => {
    const { addReviewComment, removeReviewComment } = useStore.getState();
    addReviewComment("a1", note("one"));
    addReviewComment("a1", note("two"));
    const first = useStore.getState().reviewComments["a1"]?.[0];
    removeReviewComment("a1", first?.id ?? "");
    expect(useStore.getState().reviewComments["a1"]?.map((c) => c.text)).toEqual(["two"]);
  });

  it("sends every comment as one follow-up and clears them", async () => {
    const sendMessage = vi.fn((threadId: string, text: string) => {
      useStore.setState({ threads: { [threadId]: threadWith(text) } });
      return Promise.resolve();
    });
    useStore.setState({ sendMessage });
    const { addReviewComment, sendReview } = useStore.getState();
    addReviewComment("a1", note("one"));
    addReviewComment("a1", note("two"));

    await sendReview("a1");

    expect(sendMessage).toHaveBeenCalledTimes(1);
    const text = sendMessage.mock.calls[0]?.[1] ?? "";
    expect(text).toContain("src/a.ts:3");
    expect(text).toContain("one");
    expect(text).toContain("two");
    expect(useStore.getState().reviewComments["a1"]).toEqual([]);
  });

  it("keeps the comments when the follow-up did not go out", async () => {
    useStore.setState({ sendMessage: vi.fn(() => Promise.resolve()) });
    const { addReviewComment, sendReview } = useStore.getState();
    addReviewComment("a1", note("one"));

    await sendReview("a1");

    expect(useStore.getState().reviewComments["a1"]?.map((c) => c.text)).toEqual(["one"]);
  });
});
