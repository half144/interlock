import { useRef, useState } from "react";
import { useStore } from "@/stores/app-store";
import { providerView, USAGE_KINDS } from "@/lib/usage";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useEscape } from "@/hooks/useEscape";

export function useUsagePill() {
  const usage = useStore((s) => s.usage);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const now = Date.now();

  useClickOutside(root, () => setOpen(false), open);
  useEscape(() => {
    setOpen(false);
    trigger.current?.focus();
  }, open);

  return {
    providers: USAGE_KINDS.map((kind) =>
      providerView(
        kind,
        usage.find((u) => u.kind === kind),
        now,
      ),
    ),
    open,
    root,
    trigger,
    toggle: () => setOpen((o) => !o),
  };
}
