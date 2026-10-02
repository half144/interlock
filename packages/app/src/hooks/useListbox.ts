import { useEffect, useRef, useState, type KeyboardEvent } from "react";

/** The highlight and keyboard navigation of a short listbox: arrows, Home/End, Enter or Space to pick, Escape or Tab to close. */
export function useListbox(
  value: string,
  options: { id: string }[],
  onPick: (id: string) => void,
  onClose: () => void,
) {
  const [active, setActive] = useState(value);
  const list = useRef<HTMLDivElement>(null);

  useEffect(() => list.current?.focus(), []);

  const move = (to: number) => {
    const option = options[Math.min(options.length - 1, Math.max(0, to))];
    if (option) setActive(option.id);
  };

  const onKey = (e: KeyboardEvent) => {
    const at = options.findIndex((o) => o.id === active);
    if (e.key === "ArrowDown") move(at + 1);
    else if (e.key === "ArrowUp") move(at - 1);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(options.length - 1);
    else if (e.key === "Enter" || e.key === " ") onPick(active);
    else if (e.key === "Escape" || e.key === "Tab") onClose();
    else return;
    e.preventDefault();
  };

  return { active, setActive, list, onKey };
}
