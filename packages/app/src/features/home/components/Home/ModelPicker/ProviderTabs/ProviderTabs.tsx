import type { AgentKind, ProviderEntry } from "@/types";
import { cn } from "@/lib/utils";
import { segment } from "@/lib/styles";
import { AgentMark } from "@/components/ui/AgentMark/AgentMark";

interface ProviderTabsProps {
  providers: ProviderEntry[];
  value: AgentKind;
  onChange: (kind: AgentKind) => void;
}

export function ProviderTabs({ providers, value, onChange }: ProviderTabsProps) {
  return (
    <div role="tablist" className="flex gap-0.5 rounded-[10px] bg-hover p-0.5">
      {providers.map((p) => (
        <button
          key={p.kind}
          type="button"
          role="tab"
          aria-selected={p.kind === value}
          tabIndex={-1}
          onClick={() => onChange(p.kind)}
          className={cn(
            "flex h-7 min-w-0 flex-1 items-center justify-center gap-1.5 px-2 rounded-lg text-[12.5px] transition-colors duration-150",
            p.kind === value ? cn(segment, "text-ink") : "text-ink-3 hover:text-ink-2",
          )}
        >
          <AgentMark kind={p.kind} className="size-4" />
          <span className="truncate">{p.label}</span>
        </button>
      ))}
    </div>
  );
}
