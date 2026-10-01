import { useStore } from "@/stores/app-store";
import { needsSetup } from "@/lib/diagnostics";
import { useTools } from "@/hooks/useTools";

export function useFirstRun() {
  const tools = useTools();
  const setup = useStore((s) => s.setup);
  const setSetup = useStore((s) => s.setSetup);
  const missing = tools.tools ? needsSetup(tools.tools) : false;
  const visible = tools.tools !== null && (setup === "shown" || (setup === "auto" && missing));

  return { ...tools, visible, ready: !missing, close: () => setSetup("hidden") };
}
