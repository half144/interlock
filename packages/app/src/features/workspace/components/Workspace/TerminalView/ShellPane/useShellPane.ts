import { useEffect, useRef, useState } from "react";
import { connectTerminal, ensureShell, type TerminalConnection } from "@/daemon/terminals";
import type { ShellStatus } from "@/features/workspace/utils/terminal";
import { mountXterm } from "@/features/workspace/utils/xterm";
import type { Agent } from "@/types";

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : "The shell could not be opened.";

export function useShellPane(agent: Agent) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<ShellStatus>({ name: "connecting" });
  const [attempt, setAttempt] = useState(0);
  const { cwd, workspaceId } = agent;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let connection: TerminalConnection | null = null;
    let printed = false;
    const unmounted = new AbortController();
    const isUnmounted = () => unmounted.signal.aborted;
    const term = mountXterm(host, {
      onData: (data) => connection?.input(data),
      onResize: (size) => connection?.resize(size),
    });
    setStatus({ name: "connecting" });

    const open = async () => {
      await nextFrame();
      const id = await ensureShell({ cwd, workspaceId }, term.size());
      if (isUnmounted()) return;
      const opened = await connectTerminal(id, term.size(), {
        output: (data) => {
          term.write(data);
          printed = true;
          setStatus((current) => (current.name === "starting" ? { name: "ready" } : current));
        },
        restore: (data) => {
          term.reset();
          term.write(data);
          printed ||= data.length > 0;
        },
        exit: () => setStatus({ name: "exited" }),
      });
      if (isUnmounted()) {
        opened.close();
        return;
      }
      connection = opened;
      opened.resize(term.size());
      setStatus({ name: printed ? "ready" : "starting" });
      term.focus();
    };
    open().catch((error: unknown) => {
      if (!isUnmounted()) setStatus({ name: "failed", message: messageOf(error) });
    });

    return () => {
      unmounted.abort();
      connection?.close();
      term.dispose();
    };
  }, [cwd, workspaceId, attempt]);

  return { hostRef, status, reconnect: () => setAttempt((n) => n + 1) };
}
