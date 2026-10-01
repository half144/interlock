import type { Subagent } from "@/types";
import { SendButton } from "@/components/ui/SendButton/SendButton";
import { ComposerFrame } from "@/components/ui/ComposerFrame/ComposerFrame";
import { useSubagentComposer } from "./useSubagentComposer";

/** The provider takes no message for a subagent, so the words go to the main agent, naming this one. */
export function SubagentComposer({ sub, parent }: { sub: Subagent; parent: string }) {
  const { text, setText, send, onKeyDown, canSend } = useSubagentComposer(sub);

  return (
    <ComposerFrame>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        rows={1}
        aria-label={`Message ${parent} about ${sub.name}`}
        placeholder={`Message ${parent} about this subagent`}
        className="block max-h-36 min-h-[48px] w-full resize-none bg-transparent px-4 pt-3.5 pb-1 text-[14.5px] leading-relaxed text-ink outline-none placeholder:text-ink-4 [field-sizing:content]"
      />
      <div className="flex items-center gap-2 px-3 pb-3">
        <span className="text-[12px] text-ink-4">Sent to {parent}, which relays it</span>
        <SendButton onClick={send} disabled={!canSend} className="ml-auto" />
      </div>
    </ComposerFrame>
  );
}
