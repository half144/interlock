import { useCopy } from "@/hooks/useCopy";
import { cn } from "@/lib/utils";
import { field, monoText } from "@/lib/styles";
import { Button } from "@/components/ui/Button/Button";
import { CopyIcon } from "@/components/ui/CopyIcon/CopyIcon";

interface CopyFieldProps {
  value: string;
  label: string;
}

/** A literal the user is meant to copy (a link, a command), set in mono beside a copy button. */
export function CopyField({ value, label }: CopyFieldProps) {
  const { copied, copy } = useCopy();
  return (
    <div className="flex items-center gap-2">
      <span className={cn(field, monoText, "flex h-9 min-w-0 flex-1 items-center px-3")}>
        <span className="truncate">{value}</span>
      </span>
      <Button
        aria-label={copied ? "Copied" : label}
        onClick={() => copy(value)}
        className="w-9 px-0"
      >
        <CopyIcon copied={copied} />
      </Button>
    </div>
  );
}
