import type { UsageTone } from "@/lib/usage";
import { cn } from "@/lib/utils";
import { toneText } from "../../tone";

/** A reading under the lead: its name, when it resets, and the value in a right-aligned column. */
export function UsageRow({
  label,
  meta,
  value,
  tone = "default",
}: {
  label: string;
  meta?: string | null;
  value: string;
  tone?: UsageTone;
}) {
  return (
    <li className="flex items-baseline gap-3 text-[12.5px]">
      <span className="min-w-0 truncate text-ink-2">{label}</span>
      <span className="ml-auto shrink-0 text-[12px] text-ink-3">{meta}</span>
      <span className={cn("min-w-9 shrink-0 text-right text-ink-2 tabular-nums", toneText[tone])}>
        {value}
      </span>
    </li>
  );
}
