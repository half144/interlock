import { FolderOpen, MousePointer2 } from "lucide-react";
import { Collapse } from "@/components/ui/Collapse/Collapse";
import { ChipRow } from "./ChipRow/ChipRow";
import { RepositoryChip } from "./RepositoryChip/RepositoryChip";
import { useStartInRepository } from "./useStartInRepository";

/** The git repositories found on this machine, newest work first: one click makes one the first project. */
export function StartInRepository({
  adding,
  onAdd,
  onPick,
}: {
  adding: string | null;
  onAdd: (path: string) => void;
  onPick: () => void;
}) {
  const { chips } = useStartInRepository();

  return (
    <section className="mt-10">
      <header className="flex items-center gap-3 px-1">
        <h2 className="placard">Start in a repository</h2>
        <span className="ml-auto flex items-center gap-3 text-[12.5px]">
          <button
            type="button"
            onClick={onPick}
            className="flex items-center gap-1.5 text-ink-3 transition-colors hover:text-ink"
          >
            <FolderOpen className="size-3.5" />
            Choose folder…
          </button>
          <span aria-hidden className="h-3 w-px bg-seam-2" />
          <span className="flex items-center gap-1.5 text-ink-4">
            <MousePointer2 className="size-3.5" />
            Drop a folder
          </span>
        </span>
      </header>
      <Collapse open={chips.length > 0}>
        <ChipRow count={chips.length}>
          {chips.map((chip) => (
            <RepositoryChip
              key={chip.path}
              name={chip.name}
              title={chip.title}
              adding={adding === chip.path}
              disabled={adding !== null}
              onAdd={() => onAdd(chip.path)}
            />
          ))}
        </ChipRow>
      </Collapse>
    </section>
  );
}
