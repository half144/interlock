import { Folder, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const swap = "[grid-area:1/1] transition-[opacity,translate] duration-150 ease-out-quint";

/** One repository: its name and folder, how recently it was worked on, and "Add" on hover or focus. */
export function RepositoryRow({
  name,
  folder,
  active,
  adding,
  disabled,
  onAdd,
}: {
  name: string;
  folder: string;
  active: string;
  adding: boolean;
  disabled: boolean;
  onAdd: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={disabled}
      className="group flex h-11 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors enabled:hover:bg-hover"
    >
      <Folder className="size-4 shrink-0 text-ink-3" />
      <span className="shrink-0 truncate text-[14px] text-ink">{name}</span>
      <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-ink-3">{folder}</span>
      {adding ? (
        <span className="flex shrink-0 items-center gap-1.5 text-[12.5px] text-ink-2">
          <Loader2 className="size-3.5 animate-spin" />
          Adding
        </span>
      ) : (
        <span className="grid shrink-0 justify-items-end text-[12.5px]">
          <span
            className={cn(
              swap,
              "text-ink-4 tabular-nums group-enabled:group-hover:opacity-0 group-focus-visible:opacity-0",
            )}
          >
            {active}
          </span>
          <span
            className={cn(
              swap,
              "flex translate-x-1 items-center gap-1 text-ink-2 opacity-0 group-enabled:group-hover:translate-x-0 group-enabled:group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
            )}
          >
            <Plus className="size-3.5" />
            Add
          </span>
        </span>
      )}
    </button>
  );
}
