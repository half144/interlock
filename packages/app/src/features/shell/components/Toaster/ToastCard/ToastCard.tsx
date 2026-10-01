import { useEffect } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { useStore, type Toast } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut, spring } from "@/lib/motion";
import { Describer } from "@/components/ui/Describer/Describer";
import { Lamp } from "@/components/ui/Lamp/Lamp";
import { surface } from "@/lib/styles";

/** A finished task or subagent, with a shortcut to it; it dismisses itself after a few seconds. */
export function ToastCard({ toast }: { toast: Toast }) {
  const agent = useStore((s) => s.agents[toast.agentId]);
  const dismiss = useStore((s) => s.dismissToast);
  const openThread = useStore((s) => s.openThread);
  const openPanel = useStore((s) => s.openPanel);
  const openSubagent = useStore((s) => s.openSubagent);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), 6000);
    return () => clearTimeout(timer);
  }, [toast.id, dismiss]);

  if (!agent) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition: { opacity: fadeIn, default: spring } }}
      exit={{ opacity: 0, x: 24, transition: fadeOut }}
      transition={spring}
      className={cn(
        "pointer-events-auto flex items-center gap-2.5 rounded-xl py-2.5 pr-2 pl-3",
        surface.overlay,
      )}
    >
      <Lamp aspect={agent.aspect} size="md" />
      <Describer headcode={agent.headcode} aspect={agent.aspect} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] text-ink">{toast.text}</span>
        <span className="block truncate text-[12px] text-ink-3">{agent.title}</span>
      </span>
      <button
        type="button"
        onClick={() => {
          openThread(agent.threadId);
          if (toast.subagentId) openSubagent(toast.subagentId);
          else openPanel("diff");
          dismiss(toast.id);
        }}
        className="rounded-md px-2 py-1 text-[12.5px] font-medium text-ink hover:bg-selected"
      >
        {toast.subagentId ? "View" : "Review"}
      </button>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => dismiss(toast.id)}
        className="rounded-md p-1 text-ink-3 hover:bg-selected hover:text-ink"
      >
        <X className="size-3.5" />
      </button>
    </motion.div>
  );
}
