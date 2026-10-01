import { Folder, Loader2 } from "lucide-react";
import { Pill } from "@/components/ui/Pill/Pill";

export function RepositoryChip({
  name,
  title,
  adding,
  disabled,
  onAdd,
}: {
  name: string;
  title: string;
  adding: boolean;
  disabled: boolean;
  onAdd: () => void;
}) {
  return (
    <Pill
      onClick={onAdd}
      disabled={disabled}
      title={title}
      className="shrink-0 text-ink-2 enabled:hover:text-ink disabled:opacity-60"
    >
      {adding ? (
        <Loader2 className="size-3.5 animate-spin text-ink-3" />
      ) : (
        <Folder className="size-3.5 text-ink-3" />
      )}
      {name}
    </Pill>
  );
}
