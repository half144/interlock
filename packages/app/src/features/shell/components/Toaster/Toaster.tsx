import { AnimatePresence } from "motion/react";
import { ToastCard } from "./ToastCard/ToastCard";
import { useToaster } from "./useToaster";

export function Toaster() {
  const toasts = useToaster();
  return (
    <div
      className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-80 flex-col gap-2"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
