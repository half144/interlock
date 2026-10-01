import { useState, type ReactNode } from "react";
import { ChevronDown, FolderSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { pressable } from "@/lib/styles";
import { Collapse } from "@/components/ui/Collapse/Collapse";

interface ExploreGroupProps {
  summary: string;
  running: boolean;
  failures: number;
  children: ReactNode;
}

/** A run of reads and searches as one line ("Read 4 files and searched twice") that opens to each call. */
export function ExploreGroup({ summary, running, failures, children }: ExploreGroupProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full flex-col items-start">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "inline-flex h-7 max-w-full items-center gap-2 rounded-full px-3 text-[13px] text-ink-2 hover:bg-raised active:scale-[0.98]",
          pressable,
          open ? "bg-raised" : "bg-inset",
        )}
      >
        <FolderSearch className="size-3.5 shrink-0 text-ink-3" />
        <span className={cn("min-w-0 truncate", running && "shimmer")}>{summary}</span>
        {failures > 0 && <span className="shrink-0 text-[12px] text-red">{failures} failed</span>}
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-ink-3 transition-transform duration-200 ease-out-quint",
            open && "rotate-180",
          )}
        />
      </button>
      <Collapse open={open} className="w-full">
        <div className="mt-1.5 ml-[18px] flex flex-col items-start gap-1.5 border-l border-seam pb-0.5 pl-3.5">
          {children}
        </div>
      </Collapse>
    </div>
  );
}
