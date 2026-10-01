import { useState } from "react";
import type { Subagent, SubagentStatus } from "@/types";
import { useStore } from "@/stores/app-store";
import { SendButton } from "@/components/ui/SendButton/SendButton";
import { ComposerFrame } from "@/components/ui/ComposerFrame/ComposerFrame";

const placeholder: Record<SubagentStatus, (name: string) => string> = {
  running: (name) => `Message the ${name} while it works`,
  queued: (name) => `Add to the ${name}’s brief`,
  done: () => "Ask a follow-up. It picks up where it left off",
  stopped: () => "Tell it what to do differently",
  failed: () => "Tell it what to try instead",
};

/** Talk to the subagent directly, and optionally post the same words in the main chat. */
export function SubagentComposer({ sub, parentLabel }: { sub: Subagent; parentLabel: string }) {
  const messageSubagent = useStore((s) => s.messageSubagent);
  const [text, setText] = useState("");
  const [alsoParent, setAlsoParent] = useState(false);

  const send = () => {
    if (!text.trim()) return;
    messageSubagent(sub.id, text.trim(), alsoParent);
    setText("");
  };

  return (
    <ComposerFrame>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
          }
        }}
        rows={1}
        aria-label={`Message ${sub.name}`}
        placeholder={placeholder[sub.status](sub.name.toLowerCase())}
        className="block max-h-36 min-h-[48px] w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-[14.5px] leading-relaxed text-ink outline-none placeholder:text-ink-4 [field-sizing:content]"
      />
      <div className="flex items-center gap-2 px-3 pb-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-md px-1 text-[12.5px] text-ink-3 hover:text-ink-2">
          <input
            type="checkbox"
            checked={alsoParent}
            onChange={(e) => setAlsoParent(e.target.checked)}
            className="size-3.5 accent-ink"
          />
          Also send to {parentLabel}
        </label>
        <SendButton onClick={send} disabled={!text.trim()} className="ml-auto" />
      </div>
    </ComposerFrame>
  );
}
