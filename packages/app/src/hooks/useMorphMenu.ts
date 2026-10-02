import { useRef, useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";

const APP_BAR = 52;

/** Open state for a pill that morphs into a menu `height` px tall: it grows upward unless that would end under the app bar. */
export function useMorphMenu(height: number) {
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
    show: () => {
      const bottom = root.current?.getBoundingClientRect().bottom ?? window.innerHeight;
      setSide(bottom - APP_BAR >= height ? "top" : "bottom");
      setOpen(true);
    },
    close: () => {
      setOpen(false);
      trigger.current?.focus();
    },
  };
}
