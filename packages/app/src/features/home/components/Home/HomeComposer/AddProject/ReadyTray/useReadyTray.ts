import { useStore } from "@/stores/app-store";
import { readyAgents } from "@/features/home/utils/readyAgents";

export function useReadyTray() {
  const tools = useStore((s) => s.tools);
  const usage = useStore((s) => s.usage);
  return { agents: tools ? readyAgents(tools, usage) : [] };
}
