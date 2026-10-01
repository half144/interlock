import type { Agent } from "@/types";
import { useTerminal } from "@/features/workspace/hooks/useTerminal";
import { TerminalOutput } from "./TerminalOutput/TerminalOutput";
import { TerminalPanes } from "./TerminalPanes/TerminalPanes";

export function TerminalView({ agent }: { agent: Agent }) {
  const { pane, setPane, lines, input, setInput, run, scrollRef } = useTerminal(agent);

  return (
    <div className="flex h-full flex-col bg-inset">
      <div className="flex h-8 shrink-0 items-center gap-1 border-b border-seam px-2">
        <TerminalPanes pane={pane} onChange={setPane} />
        <span className="ml-auto min-w-0 truncate pr-2 font-mono text-[11px] text-ink-4">
          zsh · ~/.interlock/worktrees/{agent.branch}
        </span>
      </div>

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-4 py-3 font-mono text-xs leading-[1.7]"
      >
        <TerminalOutput lines={lines} live={pane === "agent" && agent.aspect === "running"} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
        className="flex h-9 shrink-0 items-center gap-2 border-t border-seam px-4 font-mono text-xs"
      >
        <span className="text-ink-3 select-none">{agent.headcode} $</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="git status, pnpm test, ls"
          aria-label="Run a command in this worktree"
          className="min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-4 focus:outline-none"
          spellCheck={false}
        />
      </form>
    </div>
  );
}
