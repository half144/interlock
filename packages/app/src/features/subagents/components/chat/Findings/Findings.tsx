import { Check } from "lucide-react";

export function Findings({ items }: { items: string[] }) {
  return (
    <ul className="mt-2.5 flex flex-col gap-1.5">
      {items.map((f) => (
        <li key={f} className="flex items-start gap-2 text-[13.5px] text-ink-2">
          <Check className="mt-0.5 size-3.5 shrink-0 text-green" />
          {f}
        </li>
      ))}
    </ul>
  );
}
