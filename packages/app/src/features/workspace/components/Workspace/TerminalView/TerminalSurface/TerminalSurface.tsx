import type { ReactNode, RefObject } from "react";

interface TerminalSurfaceProps {
  hostRef: RefObject<HTMLDivElement | null>;
  /** Something to say over the screen: connecting, failed, exited. */
  notice?: ReactNode;
}

/** The screen xterm draws into, with room for a notice over it. */
export function TerminalSurface({ hostRef, notice }: TerminalSurfaceProps) {
  return (
    <div className="relative h-full min-h-0 bg-inset py-2 pl-4">
      <div ref={hostRef} className="h-full" />
      {notice}
    </div>
  );
}
