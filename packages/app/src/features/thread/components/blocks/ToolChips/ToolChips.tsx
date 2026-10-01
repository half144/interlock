import type { ToolChip } from "@/types";
import { tools } from "@/lib/tools";
import { cn } from "@/lib/utils";

export function ToolChips({ chips, className }: { chips: ToolChip[]; className?: string }) {
  return (
    <div className={cn("flex flex-col items-start gap-1.5", className)}>
      {chips.map((t, i) => {
        const Icon = tools[t.tool].icon;
        return (
          <span
            key={t.callId ?? `${i}:${t.label}`}
            className={cn(
              "inline-flex h-7 max-w-full items-center gap-2 rounded-full bg-inset px-3 text-[13px] text-ink-2",
              t.failed && "text-red",
            )}
          >
            <Icon className="size-3.5 shrink-0 text-ink-3" />
            <span className="truncate">{t.label}</span>
          </span>
        );
      })}
    </div>
  );
}
