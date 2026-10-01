import type { ReactNode } from "react";

interface TerminalNoticeProps {
  message: string;
  /** What the user can do about it. */
  action?: ReactNode;
}

export function TerminalNotice({ message, action }: TerminalNoticeProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-inset/80 px-6 text-center">
      <p className="max-w-[360px] text-[13px] leading-[1.5] text-ink-2">{message}</p>
      {action}
    </div>
  );
}
