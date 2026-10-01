import { monoText } from "@/lib/styles";
import { cn } from "@/lib/utils";

export function HoldTarget({
  command,
  file,
}: {
  command?: string | undefined;
  file?: string | undefined;
}) {
  const target = command ?? file;
  if (!target) return null;

  return (
    <div
      className={cn(
        monoText,
        "mt-3 rounded-lg bg-inset px-3 py-2 break-all whitespace-pre-wrap text-ink",
      )}
    >
      {command && <span className="text-ink-3">$ </span>}
      {target}
    </div>
  );
}
