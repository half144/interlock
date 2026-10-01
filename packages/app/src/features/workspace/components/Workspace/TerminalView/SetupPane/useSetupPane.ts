import { useEffect, useRef } from "react";
import { useStore } from "@/stores/app-store";
import { outputStep, setupNotice, setupOutput } from "@/features/workspace/utils/setupOutput";
import { mountXterm, type XtermHandle } from "@/features/workspace/utils/xterm";
import type { Agent } from "@/types";

export function useSetupPane(agent: Agent) {
  const run = useStore((s) => (agent.workspaceId ? s.setupRuns[agent.workspaceId] : undefined));
  const hostRef = useRef<HTMLDivElement>(null);
  const screen = useRef<XtermHandle | null>(null);
  const shown = useRef("");
  const output = setupOutput(run);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const term = mountXterm(host, { readOnly: true });
    screen.current = term;
    shown.current = "";
    return () => {
      screen.current = null;
      term.dispose();
    };
  }, []);

  useEffect(() => {
    const term = screen.current;
    if (!term) return;
    const step = outputStep(shown.current, output);
    if (step.reset) term.reset();
    term.write(step.text);
    shown.current = output;
  }, [output]);

  return { hostRef, notice: setupNotice(run) };
}
