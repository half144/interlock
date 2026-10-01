import { motion } from "motion/react";
import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { ComposerFrame } from "@/components/ui/ComposerFrame/ComposerFrame";
import { SendButton } from "@/components/ui/SendButton/SendButton";
import { SwapText } from "@/components/ui/SwapText/SwapText";
import { fadeIn, spring } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { ReadyTray } from "./ReadyTray/ReadyTray";
import { RepositoryList } from "./RepositoryList/RepositoryList";
import { useAddProject } from "./useAddProject";

/** The home before any project: the composer asks for a repository, by picker, by drop or from the ones on disk. */
export function AddProject() {
  const { prompt, dragging, adding, error, pick, add } = useAddProject();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0, transition: { y: spring, opacity: fadeIn, delay: 0.06 } }}
      className="mt-8"
    >
      <motion.div
        animate={{ scale: dragging ? 1.015 : 1 }}
        transition={spring}
        className="relative z-10"
      >
        <ComposerFrame className={cn(dragging && "ring-1 ring-run/60")}>
          <p className="px-5 pt-4 pb-5 text-[15px] leading-relaxed">
            <SwapText text={prompt} className={dragging || adding ? "text-ink" : "text-ink-4"} />
          </p>
          <div className="flex items-center gap-1.5 px-3 pb-3">
            <Button
              variant="primary"
              icon={<FolderPlus />}
              onClick={pick}
              disabled={adding !== null}
            >
              Choose repository
            </Button>
            <span className="ml-auto">
              <SendButton label="Start task" disabled />
            </span>
          </div>
        </ComposerFrame>
      </motion.div>
      <ReadyTray />
      {error && (
        <p role="alert" className="mt-3 px-3 text-[13px] text-red">
          {error}
        </p>
      )}
      <RepositoryList adding={adding} onAdd={add} />
    </motion.div>
  );
}
