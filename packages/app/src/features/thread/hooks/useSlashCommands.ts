import { useEffect, useState, type KeyboardEvent } from "react";
import {
  matchSlash,
  slashOptionId,
  type SlashCommand,
} from "@/features/thread/utils/slashCommands";

export function useSlashCommands(
  commands: SlashCommand[],
  text: string,
  setText: (text: string) => void,
) {
  const [active, setActive] = useState(0);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const items = dismissed === text ? [] : matchSlash(commands, text);
  useEffect(() => {
    document.getElementById(slashOptionId(active))?.scrollIntoView({ block: "nearest" });
  }, [active, items.length]);

  const pick = (name: string) => setText(`${name} `);

  /** Handles the menu's keys and reports whether it did, so the composer leaves those keys alone. */
  const onKey = (e: KeyboardEvent) => {
    if (items.length === 0) return false;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i + (e.key === "ArrowDown" ? 1 : items.length - 1)) % items.length);
      return true;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setDismissed(text);
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

  return { items, active, pick, onKey, hover: setActive, reset: () => setActive(0) };
}
