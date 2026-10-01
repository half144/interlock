import { useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Mic, Plus } from "lucide-react";
import type { Agent, Thread } from "@/types";
import { useStore } from "@/stores/app-store";
import { fadeIn, fadeOut, spring } from "@/lib/motion";
import { ComposerFrame } from "@/components/ui/ComposerFrame/ComposerFrame";
import { RoundButton } from "@/components/ui/RoundButton/RoundButton";
import { SendButton } from "@/components/ui/SendButton/SendButton";
import { EffortPicker } from "@/components/effort/EffortPicker/EffortPicker";
import { useSlashCommands } from "@/features/thread/hooks/useSlashCommands";
import { COMPOSER_ID } from "@/features/thread/utils/focusComposer";
import { SlashMenu } from "./SlashMenu/SlashMenu";

const swap = {
  initial: { opacity: 0, scale: 0.6 },
  animate: { opacity: 1, scale: 1, transition: { scale: spring, opacity: fadeIn } },
  exit: { opacity: 0, scale: 0.6, transition: fadeOut },
};

export function Composer({ thread, agent }: { thread: Thread; agent: Agent }) {
  const sendMessage = useStore((s) => s.sendMessage);
  const discard = useStore((s) => s.discard);
  const setEffort = useStore((s) => s.setEffort);
  const [text, setText] = useState("");
  const slash = useSlashCommands(text, setText);
  const draft = text.trim();
  const running = agent.aspect === "running";

  const send = () => {
    if (!draft) return;
    sendMessage(thread.id, draft);
    setText("");
  };

  const onKey = (e: KeyboardEvent) => {
    if (slash.onKey(e)) return;
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <ComposerFrame className="relative z-10">
      <AnimatePresence>
        {slash.items.length > 0 && (
          <SlashMenu items={slash.items} active={slash.active} onPick={slash.pick} />
        )}
      </AnimatePresence>
      <textarea
        id={COMPOSER_ID}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          slash.reset();
        }}
        onKeyDown={onKey}
        rows={1}
        placeholder="Send message to Interlock"
        className="block max-h-40 min-h-[52px] w-full resize-none bg-transparent px-5 pt-4 pb-1 text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-4 [field-sizing:content]"
      />
      <div className="flex items-center gap-1.5 px-3 pb-3">
        <RoundButton label="Add files" variant="outline">
          <Plus />
        </RoundButton>
        <span className="ml-auto flex items-center gap-1.5">
          <EffortPicker
            value={agent.effort ?? "medium"}
            onChange={(effort) => setEffort(agent.id, effort)}
            model={agent.model}
          />
          <RoundButton label="Dictate">
            <Mic />
          </RoundButton>
          {/* Stop and send share one spot; swapping them in place keeps the eye on the same control. */}
          <span className="grid size-8">
            <AnimatePresence initial={false}>
              {running && !draft ? (
                <motion.span key="stop" {...swap} className="grid [grid-area:1/1]">
                  <RoundButton label="Stop agent" variant="solid" onClick={() => discard(agent.id)}>
                    <span className="size-2.5 rounded-[2px] bg-ground" />
                  </RoundButton>
                </motion.span>
              ) : (
                <motion.span key="send" {...swap} className="grid [grid-area:1/1]">
                  <SendButton onClick={send} disabled={!draft} />
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </span>
      </div>
    </ComposerFrame>
  );
}
