import type { ReactNode } from "react";

/** A message handed to the subagent, right-aligned like your own: its brief, or something you sent. */
export function AskedBubble({ by, text }: { by: ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-end gap-1.5">
      <span className="flex items-center gap-1.5 text-[12.5px] text-ink-3">{by}</span>
      <p className="max-w-[88%] rounded-2xl border border-seam bg-raised px-4 py-3 text-[14.5px] leading-[1.6] text-ink shadow-button [text-wrap:pretty]">
        {text}
      </p>
    </div>
  );
}
