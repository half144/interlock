import { CopyIcon } from "@/components/ui/CopyIcon/CopyIcon";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import { useCopy } from "@/hooks/useCopy";

export function CopyButton({
  text,
  label,
  className,
}: {
  text: string;
  label: string;
  className?: string;
}) {
  const { copied, copy } = useCopy();
  return (
    <IconButton label={copied ? "Copied" : label} onClick={() => copy(text)} className={className}>
      <CopyIcon copied={copied} />
    </IconButton>
  );
}
