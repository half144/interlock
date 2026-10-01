import { useRef, useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";

// The menu's rows, its description block and the app bar it must not slide under.
const ROW_HEIGHT = 36;
const MENU_CHROME = 110;
const APP_BAR = 52;

export function useEffortPicker(optionCount: number) {
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<"top" | "bottom">("top");
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useClickOutside(root, () => setOpen(false), open);

  return {
    open,
    side,
    root,
    trigger,
    // Grows upward from the composer unless the full list would end under the app bar.
    show: () => {
      const bottom = root.current?.getBoundingClientRect().bottom ?? window.innerHeight;
      const needed = optionCount * ROW_HEIGHT + MENU_CHROME;
      setSide(bottom - APP_BAR >= needed ? "top" : "bottom");
      setOpen(true);
    },
    close: () => {
      setOpen(false);
      trigger.current?.focus();
    },
  };
}
