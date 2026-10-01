import { useRef, useState } from "react";
import { useClickOutside } from "@/hooks/useClickOutside";

export function useEffortPicker() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useClickOutside(root, () => setOpen(false), open);

  return {
    open,
    root,
    trigger,
    show: () => setOpen(true),
    close: () => {
      setOpen(false);
      trigger.current?.focus();
    },
  };
}
