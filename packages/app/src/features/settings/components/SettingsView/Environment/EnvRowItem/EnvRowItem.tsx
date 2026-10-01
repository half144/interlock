import { Eye, EyeOff, X } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import { Input } from "@/components/ui/Input/Input";
import type { EnvVar } from "@/features/settings/utils/env";

interface EnvRowItemProps {
  variable: EnvVar;
  revealed: boolean;
  onChange: (patch: Partial<EnvVar>) => void;
  onToggle: () => void;
  onRemove: () => void;
  onBlur: () => void;
}

export function EnvRowItem({
  variable,
  revealed,
  onChange,
  onToggle,
  onRemove,
  onBlur,
}: EnvRowItemProps) {
  const label = variable.name || "new variable";
  return (
    <div className="flex items-center gap-2 py-1.5 pr-2.5 pl-4">
      <Input
        mono
        className="w-52 shrink-0"
        value={variable.name}
        placeholder="NAME"
        aria-label="Variable name"
        spellCheck={false}
        onChange={(e) => onChange({ name: e.target.value })}
        onBlur={onBlur}
      />
      <Input
        mono
        className="min-w-0 flex-1"
        type={revealed ? "text" : "password"}
        value={variable.value}
        placeholder="value"
        aria-label={`Value of ${label}`}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => onChange({ value: e.target.value })}
        onBlur={onBlur}
      />
      <IconButton label={revealed ? `Hide ${label}` : `Reveal ${label}`} onClick={onToggle}>
        {revealed ? <EyeOff /> : <Eye />}
      </IconButton>
      <IconButton label={`Remove ${label}`} onClick={onRemove}>
        <X />
      </IconButton>
    </div>
  );
}
