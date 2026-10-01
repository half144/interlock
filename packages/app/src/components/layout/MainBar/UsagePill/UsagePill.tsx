import { useId } from "react";
import { MorphShape } from "@/components/ui/MorphShape/MorphShape";
import { MorphSurface } from "@/components/ui/MorphSurface/MorphSurface";
import { PillReading } from "./PillReading/PillReading";
import { ProviderUsageSection } from "./ProviderUsageSection/ProviderUsageSection";
import { useUsagePill } from "./useUsagePill";

/**
 * Each provider's mark and what is left of its tightest window. Like the effort pill, it doesn't open a
 * popover so much as become one: its outline stretches down into every window, balance and reset.
 */
export function UsagePill() {
  const shape = useId();
  const { providers, open, root, trigger, toggle } = useUsagePill();

  return (
    <div ref={root} className="relative">
      <button
        ref={trigger}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Usage left"
        className="relative inline-flex h-8 items-center gap-3 rounded-full px-3 text-[13px] text-ink transition-colors hover:bg-hover"
      >
        {!open && <MorphShape id={shape} className="border border-seam" />}
        {providers.map((p) => (
          <PillReading key={p.kind} view={p} />
        ))}
      </button>

      <MorphSurface id={shape} open={open} side="bottom" className="w-[300px]">
        <div role="dialog" aria-label="Usage left" className="divide-y divide-seam">
          {providers.map((p) => (
            <ProviderUsageSection key={p.kind} view={p} />
          ))}
        </div>
      </MorphSurface>
    </div>
  );
}
