import { useState } from "react";
import { useStore } from "@/stores/app-store";
import { homeRelative, type Pane } from "@/features/workspace/utils/terminal";
import type { Agent } from "@/types";

export function useTerminalView(agent: Agent) {
  const setup = useStore((s) => (agent.workspaceId ? s.setupRuns[agent.workspaceId] : undefined));
  const [pane, setPane] = useState<Pane>(
    setup?.state === "running" || setup?.state === "failed" ? "setup" : "shell",
  );

  return { pane, setPane, cwd: homeRelative(agent.cwd) };
}
