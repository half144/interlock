import { useEffect, useRef, type KeyboardEvent } from "react";
import { canPlanFirst } from "@/daemon/adapters/modes";
import { useAttachmentDraft } from "@/hooks/useAttachmentDraft";
import { effortsOf } from "@/lib/providers";
import { useStore } from "@/stores/app-store";
import type { Agent, Thread } from "@/types";
import { useDraft } from "@/features/thread/hooks/useDraft";
import { useAgentSkills } from "@/features/thread/hooks/useAgentSkills";
import { useSlashCommands } from "@/features/thread/hooks/useSlashCommands";
import { COMPOSER_PREFILL } from "@/features/thread/utils/focusComposer";
import { commandsFor, parseSlash, skillCommands } from "@/features/thread/utils/slashCommands";

export function useComposer(thread: Thread, agent: Agent) {
  const sendMessage = useStore((s) => s.sendMessage);
  const interrupt = useStore((s) => s.interrupt);
  const setEffort = useStore((s) => s.setEffort);
  const startPlanning = useStore((s) => s.startPlanning);
  const providers = useStore((s) => s.providers);
  const attachments = useAttachmentDraft();
  const [text, setText] = useDraft(thread.id);
  const input = useRef<HTMLTextAreaElement>(null);
  const commands = commandsFor(canPlanFirst(agent.kind));
  const skills = useAgentSkills(agent.id);
  const slash = useSlashCommands([...commands, ...skillCommands(skills)], text, setText);
  const draft = text.trim();
  const running = agent.aspect === "running";
  const hasContent = draft.length > 0 || attachments.items.length > 0;

  useEffect(() => {
    const prefill = (e: Event) => {
      if (e instanceof CustomEvent && typeof e.detail === "string") {
        setText((current) => current || (e.detail as string));
      }
      input.current?.focus();
    };
    window.addEventListener(COMPOSER_PREFILL, prefill);
    return () => window.removeEventListener(COMPOSER_PREFILL, prefill);
  }, [setText]);

  const send = () => {
    if (!hasContent) return;
    const slashed = parseSlash(commands, draft);
    if (slashed) void startPlanning(agent.id);
    const message = slashed ? slashed.rest : draft;
    if (message || attachments.items.length > 0) {
      void sendMessage(thread.id, message, attachments.files);
    }
    attachments.clear();
    setText("");
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (slash.onKey(e)) return;
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return {
    input,
    text,
    setText: (value: string) => {
      setText(value);
      slash.reset();
    },
    slash,
    attachments,
    efforts: effortsOf(providers, agent.kind, agent.modelId),
    running,
    hasContent,
    send,
    stop: () => void interrupt(agent.id),
    changeEffort: (effort: string) => void setEffort(agent.id, effort),
    onKeyDown,
  };
}
