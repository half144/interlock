import { Kbd } from "@/components/ui/Kbd/Kbd";

const HINTS: { keys: string[]; label: string }[] = [
  { keys: ["↑", "↓"], label: "Navigate" },
  { keys: ["↵"], label: "Open" },
  { keys: ["esc"], label: "Close" },
];

export function PaletteFooter() {
  return (
    <footer className="flex h-10 items-center gap-4 border-t border-seam px-4 text-[12px] text-ink-3">
      {HINTS.map((hint) => (
        <span key={hint.label} className="flex items-center gap-1.5">
          {hint.keys.map((k) => (
            <Kbd key={k}>{k}</Kbd>
          ))}
          {hint.label}
        </span>
      ))}
    </footer>
  );
}
