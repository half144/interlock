import { useEffect } from "react";
import { useStore, type Toast } from "@/stores/app-store";

const TOAST_MS = 6000;

export function useToastCard(toast: Toast) {
  const agent = useStore((s) => s.agents[toast.agentId]);
  const dismiss = useStore((s) => s.dismissToast);
  const openThread = useStore((s) => s.openThread);
  const openPanel = useStore((s) => s.openPanel);
  const openSubagent = useStore((s) => s.openSubagent);

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), TOAST_MS);
    return () => clearTimeout(timer);
  }, [toast.id, dismiss]);

  return {
    agent,
    dismiss: () => dismiss(toast.id),
    open: () => {
      if (!agent) return;
      openThread(agent.threadId);
      if (toast.subagentId) openSubagent(toast.subagentId);
      else openPanel("diff");
      dismiss(toast.id);
    },
  };
}
