import { AnimatePresence, motion } from "motion/react";
import type { Agent } from "@/types";
import { dockCss, fadeIn, fadeOut } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import { CopyIcon } from "@/components/ui/CopyIcon/CopyIcon";
import { surface } from "@/lib/styles";
import { Breadcrumbs } from "./Breadcrumbs/Breadcrumbs";
import { DiffFile } from "./DiffFile/DiffFile";
import { DiffModeSwitch } from "./DiffModeSwitch/DiffModeSwitch";
import { EditorTabs } from "./EditorTabs/EditorTabs";
import { Explorer } from "./Explorer/Explorer";
import { NoChanges } from "./NoChanges/NoChanges";
import { ReviewBar } from "./ReviewBar/ReviewBar";
import { useCodeTab } from "./useCodeTab";

/**
 * The worktree as a code editor, laid out the way VS Code users read one: an explorer, tabs, breadcrumbs and
 * the open file's diff. Maximized it drops its frame and becomes the mini-IDE's editor.
 */
export function CodeTab({ agent }: { agent: Agent }) {
  const {
    files,
    editor,
    file,
    maximized,
    mode,
    setMode,
    copied,
    copyPath,
    open,
    close,
    askForStatus,
  } = useCodeTab(agent);

  if (!files.length) return <NoChanges headcode={agent.headcode} onAsk={askForStatus} />;

  return (
    <div
      className={cn(
        surface.frame,
        "flex h-full overflow-hidden transition-[border-radius,border-color]",
        dockCss,
        maximized && "rounded-none border-transparent",
      )}
    >
      <Explorer
        agent={agent}
        files={files}
        selected={file?.path ?? null}
        onOpen={open}
        maximized={maximized}
      />

      <div className="relative flex min-w-0 flex-1 flex-col bg-raised">
        <EditorTabs
          tabs={editor.tabs}
          active={editor.active}
          files={files}
          onOpen={open}
          onClose={close}
          actions={
            file && (
              <>
                <IconButton
                  label={copied ? "Copied" : "Copy path"}
                  onClick={() => copyPath(file.path)}
                >
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
                <DiffFile agentId={agent.id} file={file} mode={mode} />
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          <p className="m-auto text-[13px] text-ink-3">Open a file from the explorer</p>
        )}
        <ReviewBar agentId={agent.id} />
      </div>
    </div>
  );
}
