import { useId, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { FileDiff } from "@/types";
import type { EditorTab } from "@/stores/slices/editor";
import { useStore } from "@/stores/app-store";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut, spring } from "@/lib/motion";
import { gitMark } from "@/features/workspace/utils/fileTree";
import { fileName } from "@/features/workspace/utils/language";
import { FileGlyph } from "@/features/workspace/components/editor/FileGlyph/FileGlyph";

interface EditorTabsProps {
  agentId: string;
  tabs: EditorTab[];
  active: string | null;
  files: FileDiff[];
  /** Editor actions, right of the tabs as in VS Code. */
  actions?: ReactNode;
}

/**
 * The open files as editor tabs: a single click previews a file in an italic tab the next one replaces,
 * a double click keeps it, a middle click closes it. The active tab opens onto the code below it.
 */
export function EditorTabs({ agentId, tabs, active, files, actions }: EditorTabsProps) {
  const openFile = useStore((s) => s.openFile);
  const closeFile = useStore((s) => s.closeFile);
  const group = useId();

  return (
    <div className="flex h-9 shrink-0 bg-inset">
      <div
        role="tablist"
        aria-label="Open files"
        className="flex min-w-0 flex-1 overflow-x-auto [scrollbar-width:none]"
      >
        <AnimatePresence initial={false} mode="popLayout">
          {tabs.map((tab) => {
            const selected = tab.path === active;
            const mark = gitMark[files.find((f) => f.path === tab.path)?.status ?? "modified"];
            return (
              <motion.div
                key={tab.path}
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: fadeIn }}
                exit={{ opacity: 0, transition: fadeOut }}
                transition={spring}
                role="tab"
                tabIndex={0}
                aria-selected={selected}
                onClick={() => openFile(agentId, tab.path)}
                onDoubleClick={() => openFile(agentId, tab.path, true)}
                onAuxClick={(e) => e.button === 1 && closeFile(agentId, tab.path)}
                onKeyDown={(e) => e.key === "Enter" && openFile(agentId, tab.path)}
                className={cn(
                  "group relative isolate flex shrink-0 cursor-pointer items-center gap-1.5 border-r border-b border-seam pr-1 pl-2.5 text-[12.5px] select-none",
                  selected ? "border-b-transparent text-ink" : "text-ink-3 hover:text-ink-2",
                )}
              >
                {selected && (
                  <motion.span
                    layoutId={`${group}-tab`}
                    transition={spring}
                    className="absolute inset-x-0 top-0 -bottom-px -z-10 bg-raised"
                  />
                )}
                <FileGlyph path={tab.path} />
                <span className={cn("max-w-44 truncate", tab.preview && "italic")}>
                  {fileName(tab.path)}
                </span>
                <span className={cn("font-mono text-[10.5px]", mark.tone)}>{mark.letter}</span>
                <button
                  type="button"
                  aria-label={`Close ${fileName(tab.path)}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFile(agentId, tab.path);
                  }}
                  className={cn(
                    "flex size-5 items-center justify-center rounded text-ink-3 transition-opacity hover:bg-hover hover:text-ink focus-visible:opacity-100",
                    selected ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                  )}
                >
                  <X className="size-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <span aria-hidden className="min-w-4 flex-1 border-b border-seam" />
      </div>
      <div className="flex shrink-0 items-center gap-1 border-b border-seam px-2">{actions}</div>
    </div>
  );
}
