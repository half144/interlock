import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { Effort, EffortOption } from "@/types";

export function useEffortMenu(
  value: Effort,
  options: EffortOption[],
  onPick: (effort: Effort) => void,
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
