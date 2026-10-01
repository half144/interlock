import { Check, Copy } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import { useCopy } from "@/hooks/useCopy";
import { monoText } from "@/lib/styles";

export function CommandHint({ label, command }: { label: string; command: string }) {
  const { copied, copy } = useCopy();
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[12.5px] text-ink-3">{label}</p>
      <div className="flex items-center gap-2 rounded-lg bg-hover py-1 pr-1 pl-3">
        <code className={`min-w-0 flex-1 truncate text-ink-2 ${monoText}`}>{command}</code>
        <IconButton label={copied ? "Copied" : "Copy command"} onClick={() => copy(command)}>
          {copied ? <Check /> : <Copy />}
        </IconButton>
      </div>
    </div>
  );
}
