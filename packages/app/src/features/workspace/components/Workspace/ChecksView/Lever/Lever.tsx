import { Toggle } from "@/components/ui/Toggle/Toggle";

/** A switch with its label and a line saying what turning it on does. */
export function Lever({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string;
  detail: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <Toggle checked={checked} onChange={onChange} label={label} className="mt-0.5" />
      <div>
        <div className="text-[13px] text-ink">{label}</div>
        <div className="text-xs text-ink-3">{detail}</div>
      </div>
    </div>
  );
}
