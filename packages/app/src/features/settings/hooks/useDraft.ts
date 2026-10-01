import { useEffect, useRef, useState } from "react";

const SETTLE_MS = 700;

/** A value being typed: it commits once typing settles, on blur, and when the field goes away. */
export function useDraft<T>(initial: T, commit: (value: T) => void) {
  const [draft, setDraft] = useState(initial);
  const pending = useRef<{ value: T } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latestCommit = useRef(commit);
  latestCommit.current = commit;

  const flush = () => {
    clearTimeout(timer.current);
    if (!pending.current) return;
    const { value } = pending.current;
    pending.current = null;
    latestCommit.current(value);
  };

  useEffect(() => flush, []);

  const edit = (value: T) => {
    setDraft(value);
    pending.current = { value };
    clearTimeout(timer.current);
    timer.current = setTimeout(flush, SETTLE_MS);
  };

  return { draft, edit, flush };
}
