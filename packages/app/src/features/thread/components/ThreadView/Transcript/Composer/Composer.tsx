import { AnimatePresence, motion } from "motion/react";
import type { Agent, Thread } from "@/types";
import { cn } from "@/lib/utils";
import { fadeIn, fadeOut, spring } from "@/lib/motion";
import { ComposerFrame } from "@/components/ui/ComposerFrame/ComposerFrame";
import { RoundButton } from "@/components/ui/RoundButton/RoundButton";
import { SendButton } from "@/components/ui/SendButton/SendButton";
import { AddFilesButton } from "@/components/attachments/AddFilesButton/AddFilesButton";
import { AttachmentChips } from "@/components/attachments/AttachmentChips/AttachmentChips";
import { EffortPicker } from "@/components/effort/EffortPicker/EffortPicker";
import { SlashMenu } from "./SlashMenu/SlashMenu";
import { useComposer } from "./useComposer";

const swap = {
  initial: { opacity: 0, scale: 0.6 },
  animate: { opacity: 1, scale: 1, transition: { scale: spring, opacity: fadeIn } },
  exit: { opacity: 0, scale: 0.6, transition: fadeOut },
};

export function Composer({ thread, agent }: { thread: Thread; agent: Agent }) {
  const c = useComposer(thread, agent);
  const { attachments, slash } = c;

  return (
    <ComposerFrame
      className={cn("relative z-10", attachments.dragging && "ring-1 ring-run/60")}
      {...attachments.dropTarget}
    >
      <AnimatePresence>
        {slash.items.length > 0 && (
          <SlashMenu
            items={slash.items}
            active={slash.active}
            onPick={slash.pick}
            onHover={slash.hover}
          />
        )}
      </AnimatePresence>
      <AttachmentChips items={attachments.items} onRemove={attachments.remove} />
      <textarea
        ref={c.input}
        value={c.text}
        onChange={(e) => c.setText(e.target.value)}
        onKeyDown={c.onKeyDown}
        onPaste={attachments.onPaste}
        rows={1}
        aria-label="Message"
        placeholder={c.running ? "Steer the agent while it works" : "Send message to Interlock"}
        className="block max-h-40 min-h-[52px] w-full resize-none bg-transparent px-5 pt-4 pb-1 text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-4 [field-sizing:content]"
      />
      <div className="flex items-center gap-1.5 px-3 pb-3">
        <AddFilesButton onPick={attachments.add} />
        <span className="ml-auto flex items-center gap-1.5">
          <EffortPicker
            value={agent.effort ?? ""}
            options={c.efforts}
            onChange={c.changeEffort}
            model={agent.model}
          />
          {/* Stop and send share one spot; swapping them in place keeps the eye on the same control. */}
          <span className="grid size-8">
            <AnimatePresence initial={false}>
              {c.running && !c.hasContent ? (
                <motion.span key="stop" {...swap} className="grid [grid-area:1/1]">
                  <RoundButton label="Stop agent" variant="solid" onClick={c.stop}>
                    <span className="size-2.5 rounded-[2px] bg-ground" />
                  </RoundButton>
                </motion.span>
              ) : (
                <motion.span key="send" {...swap} className="grid [grid-area:1/1]">
                  <SendButton onClick={c.send} disabled={!c.hasContent} />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </span>
      </div>
    </ComposerFrame>
  );
}
