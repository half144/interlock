import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Lamp } from "@/components/ui/Lamp/Lamp";
import { Collapse } from "@/components/ui/Collapse/Collapse";
import { checkLabel, checkLamp, type Check } from "@/features/workspace/utils/checks";

interface CheckRowProps {
  check: Check;
  expanded: boolean;
  output: string[];
  onToggle: () => void;
}

/** One CI check. A failed one opens to show its output. */
export function CheckRow({ check, expanded, output, onToggle }: CheckRowProps) {
  const expandable = check.status === "failed";

  return (
    <li className="border-b border-seam">
      <button
        type="button"
        disabled={!expandable}
        onClick={onToggle}
        aria-expanded={expandable ? expanded : undefined}
        className="flex h-12 w-full items-center gap-3 px-4 text-left transition-colors duration-150 enabled:hover:bg-raised disabled:cursor-default"
      >
        <Lamp aspect={checkLamp[check.status]} size="md" />
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[13px] text-ink">{check.name}</span>
          <span className="truncate font-mono text-[11px] text-ink-3">{check.detail}</span>
        </span>
        <span
          className={cn(
            "text-xs transition-colors duration-200",
            check.status === "failed" ? "text-red" : "text-ink-3",
          )}
        >
          {checkLabel[check.status]}
        </span>
        <span className="w-12 text-right font-mono text-[11px] text-ink-3">
          {check.status === "passed" || check.status === "failed" ? check.duration : "—"}
        </span>
        {expandable ? (
          <ChevronRight
            className={cn(
              "size-3.5 text-ink-3 transition-transform duration-200 ease-out-quint",
              expanded && "rotate-90",
            )}
          />
        ) : (
          <span className="w-3.5" />
        )}
      </button>
      <Collapse open={expanded}>
        <pre className="mx-4 mb-3 overflow-x-auto rounded-md border border-seam bg-inset px-3 py-2.5 font-mono text-xs leading-5 text-red">
          {output.join("\n")}
        </pre>
      </Collapse>
    </li>
  );
}
