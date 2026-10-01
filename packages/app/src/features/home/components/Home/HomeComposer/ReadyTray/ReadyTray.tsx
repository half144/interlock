import { ChevronRight, CircleCheck, Plug } from "lucide-react";
import { ComposerTray } from "@/components/ui/ComposerTray/ComposerTray";
import { SwapText } from "@/components/ui/SwapText/SwapText";
import { SetupMarks } from "./SetupMarks/SetupMarks";
import { useReadyTray } from "./useReadyTray";

/** Under the composer before any project, as Manus asks you to connect your tools: what this machine can run. */
export function ReadyTray() {
  const { status, openAccounts } = useReadyTray();

  return (
    <ComposerTray className="pt-4">
      <button
        type="button"
        onClick={openAccounts}
        title="Open Accounts"
        className="group flex h-9 w-full min-w-0 items-center gap-2 rounded-b-2xl pr-3 pl-4 text-left transition-colors hover:text-ink-2"
      >
        {status?.ready ? (
          <CircleCheck className="size-3.5 shrink-0 text-green" />
        ) : (
          <Plug className="size-3.5 shrink-0" />
        )}
        <span className="min-w-0 flex-1">
          <SwapText text={status?.text ?? "Checking your agents…"} />
        </span>
        {status && <SetupMarks marks={status.marks} />}
        <ChevronRight className="size-3.5 shrink-0 text-ink-4 transition-colors group-hover:text-ink-3" />
      </button>
    </ComposerTray>
  );
}
