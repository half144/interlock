import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Collapse } from "@/components/ui/Collapse/Collapse";

interface TreeFolderProps {
  name: string;
  depth: number;
  /** Holds a changed file somewhere below it. */
  changed: boolean;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}

/** A folder in the explorer: a chevron and its name, with the dot VS Code puts on folders holding changes. */
export function TreeFolder({ name, depth, changed, open, onToggle, children }: TreeFolderProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{ paddingLeft: 10 + depth * 12 }}
        className="flex h-[22px] w-full items-center gap-1 pr-3 text-left text-ink-2 hover:bg-hover"
      >
        <ChevronRight
          className={cn(
            "size-3.5 shrink-0 text-ink-3 transition-transform duration-200 ease-out-quint",
            open && "rotate-90",
          )}
        />
        <span className="min-w-0 flex-1 truncate">{name}</span>
        {changed && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-mod/70" />}
      </button>
      <Collapse open={open}>{children}</Collapse>
    </li>
  );
}
