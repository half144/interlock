import { Button } from "@/components/ui/Button/Button";
import { TerminalNotice } from "../../TerminalNotice/TerminalNotice";
import type { ShellStatus } from "@/features/workspace/utils/terminal";

interface ShellNoticeProps {
  status: ShellStatus;
  onRetry: () => void;
}

export function ShellNotice({ status, onRetry }: ShellNoticeProps) {
  if (status.name === "failed") {
    return (
      <TerminalNotice
        message={status.message}
        action={
          <Button size="sm" onClick={onRetry}>
            Try again
          </Button>
        }
      />
    );
  }
  if (status.name === "exited") {
    return (
      <TerminalNotice
        message="The shell exited."
        action={
          <Button size="sm" onClick={onRetry}>
            Start a new shell
          </Button>
        }
      />
    );
  }
  if (status.name === "ready") return null;
  return (
    <p className="pointer-events-none absolute top-2 left-4 font-mono text-[12px] text-ink-4">
      Starting shell…
    </p>
  );
}
