import { FolderPlus, Loader2 } from "lucide-react";
import { Pill } from "@/components/ui/Pill/Pill";

/** Where a project's pill sits, before there is a project: opens the folder picker. */
export function ChooseRepositoryPill({ adding, onPick }: { adding: boolean; onPick: () => void }) {
  return (
    <Pill onClick={onPick} disabled={adding} className="border-seam-2 bg-hover">
      {adding ? (
        <Loader2 className="size-3.5 animate-spin text-ink-2" />
      ) : (
        <FolderPlus className="size-3.5 text-ink-2" />
      )}
      Choose folder
    </Pill>
  );
}
