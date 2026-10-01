import { useId, useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ChevronDown, FileSearch } from "lucide-react";
import type { Agent } from "@/types";
import { projectById } from "@/mocks/projects";
import { useStore } from "@/stores/app-store";
import { useCopy } from "@/hooks/useCopy";
import { dock, dockCss, fadeIn, fadeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import { surface } from "@/lib/styles";
import { useReview } from "@/features/workspace/hooks/useReview";
import { useReviewComments } from "@/features/workspace/hooks/useReviewComments";
import { buildTree } from "@/features/workspace/utils/fileTree";
import type { DiffMode } from "@/features/workspace/utils/diff";
import { CopyIcon } from "@/features/workspace/components/CopyIcon/CopyIcon";
import { DiffFile } from "@/features/workspace/components/Workspace/CodeTab/DiffFile/DiffFile";
import { Breadcrumbs } from "@/features/workspace/components/Workspace/CodeTab/Breadcrumbs/Breadcrumbs";
import { EditorTabs } from "@/features/workspace/components/Workspace/CodeTab/EditorTabs/EditorTabs";
import { DiffModeSwitch } from "./DiffModeSwitch/DiffModeSwitch";
import { FileTree } from "./FileTree/FileTree";

/**
 * The worktree as a code editor, laid out the way VS Code users read one: an explorer, tabs, breadcrumbs and
 * the open file's diff. Maximized it drops its frame and becomes the mini-IDE's editor.
 */
export function CodeTab({ agent }: { agent: Agent }) {
  const sendMessage = useStore((s) => s.sendMessage);
  const maximized = useStore((s) => s.reviewMaximized);
  const openFile = useStore((s) => s.openFile);
  const { files, editor } = useReview(agent.id);
  const tree = useMemo(() => buildTree(files), [files]);
  const [mode, setMode] = useState<DiffMode>("unified");
  const { comments, composer, setComposer, add } = useReviewComments();
  const { copied, copy } = useCopy();
  const group = useId();

  if (!files.length) {
    return (
      <div className={cn(surface.frame, "h-full")}>
        <EmptyState
          icon={FileSearch}
          title="No changes yet"
          description={`${agent.headcode} hasn’t written to its worktree yet. Changes show up here as soon as it edits a file.`}
          action={{
            label: "Ask the agent for a status update",
            onClick: () =>
              sendMessage(agent.threadId, "Where are you at? Give me a short status update."),
          }}
        />
      </div>
    );
  }

  const index = files.findIndex((f) => f.path === editor.active);
  const file = files[index];

  return (
    <div
      className={cn(
        surface.frame,
        "flex h-full overflow-hidden transition-[border-radius,border-color]",
        dockCss,
        maximized && "rounded-none border-transparent",
      )}
    >
      <LayoutGroup id={group}>
        {/* The mini-IDE gives the explorer more room, growing on the same spring as the layout. */}
        <motion.aside
          initial={false}
          animate={{ width: maximized ? 280 : 220 }}
          transition={dock}
          className="flex shrink-0 flex-col border-r border-seam bg-inset"
          aria-label="Explorer"
        >
          <h2 className="flex h-9 shrink-0 items-center gap-1 border-b border-seam px-2.5 text-[11px] font-semibold tracking-[0.06em] text-ink-3 uppercase">
            <ChevronDown className="size-3.5" />
            {projectById[agent.projectId]?.name}
          </h2>
          <motion.div layoutScroll className="min-h-0 flex-1 overflow-y-auto py-1 text-[13px]">
            <FileTree
              nodes={tree}
              selected={file?.path ?? null}
              onOpen={(path, pin) => openFile(agent.id, path, pin)}
            />
          </motion.div>
        </motion.aside>
      </LayoutGroup>

      <div className="relative flex min-w-0 flex-1 flex-col bg-raised">
        <EditorTabs
          agentId={agent.id}
          tabs={editor.tabs}
          active={editor.active}
          files={files}
          actions={
            file && (
              <>
                <IconButton label={copied ? "Copied" : "Copy path"} onClick={() => copy(file.path)}>
                  <CopyIcon copied={copied} />
                </IconButton>
                <DiffModeSwitch mode={mode} onChange={setMode} />
              </>
            )
          }
        />
        {file ? (
          <>
            <Breadcrumbs file={file} />
            {/* Each file gets its own scroller, so opening one starts at its top instead of the last one's offset. */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${file.path}-${mode}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: fadeIn }}
                exit={{ opacity: 0, transition: fadeOut }}
                className="min-h-0 flex-1 overflow-auto"
              >
                <DiffFile
                  file={file}
                  index={index}
                  mode={mode}
                  comments={comments}
                  composer={composer}
                  onCompose={setComposer}
                  onComment={add}
                />
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <p className="m-auto text-[13px] text-ink-3">Open a file from the explorer</p>
        )}
      </div>
    </div>
  );
}
