import type { Agent } from "@/types";
import { TerminalSurface } from "../TerminalSurface/TerminalSurface";
import { ShellNotice } from "./ShellNotice/ShellNotice";
import { useShellPane } from "./useShellPane";

/** An interactive shell in the task's worktree. It keeps running on the daemon while you look elsewhere. */
export function ShellPane({ agent }: { agent: Agent }) {
  const { hostRef, status, reconnect } = useShellPane(agent);
  return (
    <TerminalSurface
      hostRef={hostRef}
      notice={<ShellNotice status={status} onRetry={reconnect} />}
    />
  );
}
