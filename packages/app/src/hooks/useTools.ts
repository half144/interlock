import { useState } from "react";
import { useStore } from "@/stores/app-store";
import { toolOf } from "@/lib/diagnostics";
import type { AuthProvider, ToolStatus } from "@/types";

type Provider = ToolStatus & { id: AuthProvider };

const isProvider = (tool: ToolStatus | undefined): tool is Provider =>
  tool?.id === "claude" || tool?.id === "codex";

/** The tools the machine has, as the screens that list them need them. */
export function useTools() {
  const tools = useStore((s) => s.tools);
  const error = useStore((s) => s.toolsError);
  const loadTools = useStore((s) => s.loadTools);
  const [checking, setChecking] = useState(false);

  const recheck = async () => {
    setChecking(true);
    await loadTools();
    setChecking(false);
  };

  return {
    tools,
    error,
    checking,
    recheck,
    git: tools && toolOf(tools, "git"),
    gh: tools && toolOf(tools, "gh"),
    providers: (tools ?? []).filter(isProvider),
  };
}
