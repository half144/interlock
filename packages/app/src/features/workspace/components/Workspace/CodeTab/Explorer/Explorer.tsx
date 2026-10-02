import { useId } from "react";
import { LayoutGroup, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import type { Agent, FileDiff } from "@/types";
import { dock } from "@/lib/motion";
import { FileTree } from "./FileTree/FileTree";
import { useExplorer } from "./useExplorer";

interface ExplorerProps {
  agent: Agent;
  files: FileDiff[];
  selected: string | null;
  /** A single click previews the file, a double click keeps its tab open. */
  onOpen: (path: string, pin: boolean) => void;
  maximized: boolean;
}

/** The worktree's real folders and files, with the changed ones wearing their git colour. */
export function Explorer({ agent, files, selected, onOpen, maximized }: ExplorerProps) {
  const { projectName, tree, load, navigate } = useExplorer(agent, files);
  const group = useId();

  return (
    // The mini-IDE gives the explorer more room, growing on the same spring as the layout.
    <motion.aside
      initial={false}
      animate={{ width: maximized ? 280 : 220 }}
      transition={dock}
      className="flex max-w-[40%] shrink-0 flex-col border-r border-seam bg-inset"
      aria-label="Explorer"
    >
      <h2 className="flex h-9 shrink-0 items-center gap-1 border-b border-seam px-2.5 text-[11px] font-semibold tracking-[0.06em] text-ink-3 uppercase">
        <ChevronDown className="size-3.5" />
        {projectName}
      </h2>
      <LayoutGroup id={group}>
        <motion.div
          layoutScroll
          onKeyDown={navigate}
          className="min-h-0 flex-1 overflow-y-auto py-1 text-[13px]"
        >
          <FileTree nodes={tree} selected={selected} onOpen={onOpen} onLoad={load} />
        </motion.div>
      </LayoutGroup>
    </motion.aside>
  );
}
