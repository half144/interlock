import type { ReactNode } from "react";
import { GitBranch, ListChecks } from "lucide-react";
import type { Agent } from "@/types";
import { Lamp } from "@/components/ui/Lamp/Lamp";
import { cn, plural } from "@/lib/utils";
import { statusLine } from "@/lib/agentStatus";
import { useReview } from "@/features/workspace/hooks/useReview";
import { languageOf } from "@/features/workspace/utils/language";

/** The mini-IDE's status bar: branch, checks and the agent on the left; the open file's format on the right. */
export function StatusBar({ agent }: { agent: Agent }) {
  const { files, editor } = useReview(agent.id);
  const { passed, failed, pending: running } = agent.checks;

  return (
    <footer className="flex h-6 items-center justify-between gap-4 border-t border-seam bg-ground px-1.5 text-[11.5px] whitespace-nowrap text-ink-3">
      <div className="flex min-w-0 items-center">
        <Item>
          <GitBranch className="size-3.5" />
          {agent.branch}
        </Item>
        <Item className={cn(failed > 0 && "text-red")}>
          <ListChecks className="size-3.5" />
          {failed
            ? `${failed} failing`
            : running
              ? `${running} running`
              : passed
                ? `${passed} passed`
                : "No checks yet"}
        </Item>
        <Item className="min-w-0">
          <Lamp aspect={agent.aspect} progress={agent.progress} />
          <span className="truncate">{statusLine(agent)}</span>
        </Item>
      </div>
      <div className="flex shrink-0 items-center">
        <Item>{plural(files.length, "file")} changed</Item>
        {editor.active && (
          <>
            <Item>Spaces: 2</Item>
            <Item>UTF-8</Item>
            <Item>LF</Item>
            <Item>{languageOf(editor.active).name}</Item>
          </>
        )}
      </div>
    </footer>
  );
}

function Item({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("flex h-6 items-center gap-1.5 px-1.5", className)}>{children}</span>;
}
