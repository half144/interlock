import { useEffect, useState } from "react";

const RESET_AFTER_MS = 1400;

/** Copies text and reports `copied` for a moment, long enough to swap the icon for a check. */
export function useCopy() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), RESET_AFTER_MS);
    return () => clearTimeout(timer);
  }, [copied]);

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
  };

  return { copied, copy };
}
