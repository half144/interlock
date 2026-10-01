import { useState } from "react";

export interface ReviewComment {
  id: number;
  text: string;
}

/** What the diff views need to thread notes under lines and open a line's composer. */
export interface ReviewNotes {
  comments: Record<string, ReviewComment[]>;
  composer: string | null;
  onCompose: (key: string | null) => void;
  onComment: (key: string, text: string) => void;
}

let commentSeq = 0;

/** Notes left on diff lines, keyed by line, and which line's composer is open. */
export function useReviewComments() {
  const [comments, setComments] = useState<Record<string, ReviewComment[]>>({});
  const [composer, setComposer] = useState<string | null>(null);

  const add = (key: string, text: string) => {
    const comment = { id: ++commentSeq, text };
    setComments((c) => ({ ...c, [key]: [...(c[key] ?? []), comment] }));
    setComposer(null);
  };

  return { comments, composer, setComposer, add };
}
