import { useRef, useState } from "react";
import { useStore } from "@/stores/app-store";
import { modelLabel } from "@/lib/providers";
import { useClickOutside } from "@/hooks/useClickOutside";
import type { ModelChoice } from "@/features/home/types";

const WINDOW_MARGIN = 16;

export function useModelPicker() {
  const providers = useStore((s) => s.providers);
  const [open, setOpen] = useState(false);
  const [maxHeight, setMaxHeight] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useClickOutside(root, () => setOpen(false), open);

  return {
    providers,
    open,
    maxHeight,
    root,
    trigger,
    labelOf: (choice: ModelChoice) => modelLabel(providers, choice.kind, choice.model),
    show: () => {
      const top = root.current?.getBoundingClientRect().top ?? 0;
      setMaxHeight(window.innerHeight - top - WINDOW_MARGIN);
      setOpen(true);
    },
    close: () => {
      setOpen(false);
      trigger.current?.focus();
    },
  };
}
