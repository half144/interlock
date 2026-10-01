import { useState, type KeyboardEvent } from "react";
import { matchSlash } from "@/features/thread/utils/slashCommands";

/** The slash menu's state: the commands matching what's typed, the highlighted one, and the keys that drive it. */
export function useSlashCommands(text: string, setText: (text: string) => void) {
  const [active, setActive] = useState(0);
  const items = matchSlash(text);
  const pick = (name: string) => setText(`${name} `);

  /** Handles the menu's keys and reports whether it did, so the composer leaves those keys alone. */
  const onKey = (e: KeyboardEvent) => {
    if (!items.length) return false;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length);
      return true;
    }
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      const item = items[active];
      if (item) pick(item.name);
      return true;
    }
    return false;
  };

  return { items, active, pick, onKey, reset: () => setActive(0) };
}
