import { useCallback, useState } from "react";

const drafts = new Map<string, string>();

/** What you were typing in a conversation waits there while you look at another one. */
export function useDraft(threadId: string) {
  const [text, setText] = useState(() => drafts.get(threadId) ?? "");
  const write = useCallback(
    (value: string | ((current: string) => string)) =>
      setText((current) => {
        const next = typeof value === "function" ? value(current) : value;
        if (next) drafts.set(threadId, next);
        else drafts.delete(threadId);
        return next;
      }),
    [threadId],
  );
  return [text, write] as const;
}
