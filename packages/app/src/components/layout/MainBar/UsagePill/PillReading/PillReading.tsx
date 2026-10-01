import type { ProviderView } from "@/lib/usage";
import { cn } from "@/lib/utils";
import { AgentMark } from "@/components/ui/AgentMark/AgentMark";
import { SwapText } from "@/components/ui/SwapText/SwapText";
import { toneText } from "../tone";

/** One provider in the pill: its mark and what is left of the window the popover leads with. */
export function PillReading({ view }: { view: ProviderView }) {
  return (
    <span className="flex items-center gap-1.5">
      <AgentMark kind={view.kind} className={cn("text-ink-3", !view.lead && "opacity-40")} />
      <span className="sr-only">{view.label}</span>
      {view.lead && (
        <SwapText
          text={`${view.lead.remainingPct}%`}
          className={cn("text-ink-2 tabular-nums", toneText[view.lead.tone])}
        />
      )}
    </span>
  );
}
