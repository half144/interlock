import { useEffect, useRef, useState } from "react";
import type { Agent, LogLine } from "@/types";
import { useStore } from "@/stores/app-store";
import { reply, serverLog, type Pane } from "@/features/workspace/utils/terminal";

/**
 * The worktree's terminal: which pane is showing, its lines (setup output, the agent's stream plus what
 * you typed, or the dev server), the prompt, and a scroller kept at the bottom.
 */
export function useTerminal(agent: Agent) {
  const stream = useStore((s) => s.logs[agent.id]);
  const [pane, setPane] = useState<Pane>("agent");
  const [typed, setTyped] = useState<LogLine[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const all = stream ?? [];
  const setupEnd = all.findIndex((l) => l.kind === "ok") + 1;
  const lines =
    pane === "setup"
      ? all.slice(0, setupEnd || all.length)
      : pane === "server"
        ? serverLog(agent)
        : [...all.slice(setupEnd), ...typed];

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines.length, pane]);

  const run = () => {
    const cmd = input.trim();
    if (!cmd) return;
    setTyped((t) =>
      cmd === "clear" ? [] : [...t, { kind: "cmd", text: cmd }, ...reply(cmd, agent)],
    );
    setInput("");
  };

  return { pane, setPane, lines, input, setInput, run, scrollRef };
}
