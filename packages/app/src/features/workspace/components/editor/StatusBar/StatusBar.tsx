import type { ReactNode } from "react";
import { GitBranch } from "lucide-react";
import type { Agent } from "@/types";
import { Lamp } from "@/components/ui/Lamp/Lamp";
import { ChecksDot } from "@/components/ship/ChecksDot/ChecksDot";
import { cn, plural } from "@/lib/utils";
import { useStatusBar } from "./useStatusBar";

/** The mini-IDE's status bar: branch, checks and the agent on the left; changes and the open file's language on the right. */
export function StatusBar({ agent }: { agent: Agent }) {
  const { branch, status, filesChanged, language, pr } = useStatusBar(agent);

  return (
    <footer className="flex h-6 items-center justify-between gap-4 border-t border-seam bg-ground px-1.5 text-[11.5px] whitespace-nowrap text-ink-3">
      <div className="flex min-w-0 items-center">
        <Item>
          <GitBranch className="size-3.5" />
          {branch}
        </Item>
        {pr.phase !== "none" && (
          <Item>
            <ChecksDot state={pr.summary.state} />
            {pr.phase === "merged" ? "Merged" : pr.summary.label}
          </Item>
        )}
        <Item className="min-w-0">
          <Lamp aspect={agent.aspect} />
          <span className="truncate">{status}</span>
        </Item>
      </div>
      <div className="flex shrink-0 items-center">
        <Item>{plural(filesChanged, "file")} changed</Item>
        {language && <Item>{language}</Item>}
      </div>
    </footer>
  );
}

function Item({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn("flex h-6 items-center gap-1.5 px-1.5", className)}>{children}</span>;
}
