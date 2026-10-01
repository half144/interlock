import type { Agent } from "@/types";
import { SetupPane } from "./SetupPane/SetupPane";
import { ShellPane } from "./ShellPane/ShellPane";
import { TerminalPanes } from "./TerminalPanes/TerminalPanes";
import { useTerminalView } from "./useTerminalView";

/** The worktree's terminal: what its setup printed, and a shell to work in. */
export function TerminalView({ agent }: { agent: Agent }) {
  const { pane, setPane, cwd } = useTerminalView(agent);

  return (
    <div className="flex h-full flex-col bg-inset">
      <div className="flex h-8 shrink-0 items-center gap-1 border-b border-seam px-2">
        <TerminalPanes pane={pane} onChange={setPane} />
        <span className="ml-auto min-w-0 truncate pr-2 font-mono text-[11px] text-ink-4">
          {cwd}
        </span>
      </div>
      <div className="min-h-0 flex-1">
        {pane === "setup" ? (
          <SetupPane key={agent.id} agent={agent} />
        ) : (
          <ShellPane key={agent.id} agent={agent} />
        )}
      </div>
    </div>
  );
}
