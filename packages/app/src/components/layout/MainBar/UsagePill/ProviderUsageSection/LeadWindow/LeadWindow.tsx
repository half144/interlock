import type { MeasuredWindow } from "@/lib/usage";
import { cn } from "@/lib/utils";
import { toneFill, toneText } from "../../tone";

/** The window closest to running out, read first: what is left, its bar, then which window and when it resets. */
export function LeadWindow({ window }: { window: MeasuredWindow }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="flex items-baseline gap-1.5">
        <span
          className={cn(
            "text-[22px] leading-none font-medium tracking-[-0.02em] text-ink tabular-nums",
            toneText[window.tone],
          )}
        >
          {window.remainingPct}%
        </span>
        <span className="text-[13px] text-ink-3">left</span>
      </p>
      <div className="h-1 overflow-hidden rounded-full bg-selected">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300 ease-out-quint",
            toneFill[window.tone],
          )}
          style={{ width: `${window.remainingPct}%` }}
        />
      </div>
      <p className="truncate text-[12px] text-ink-3">
        <span className="text-ink-2">{window.label}</span>
        {window.resets && ` · ${window.resets}`}
      </p>
    </div>
  );
}
