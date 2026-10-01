import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useStore } from "@/stores/app-store";
import { canPlanFirst } from "@/daemon/adapters/modes";
import { useAttachmentDraft } from "@/hooks/useAttachmentDraft";
import { useEffortChoice } from "@/features/home/hooks/useEffortChoice";
import type { ProjectSetup } from "@/features/home/hooks/useAddProject";
import type { ProjectChoice } from "@/features/home/hooks/useProjectChoice";
import type { ModelChoice } from "@/features/home/types";

export function useHomeComposer(choice: ModelChoice, target: ProjectChoice, setup: ProjectSetup) {
  const startTask = useStore((s) => s.startTask);
  const { preset, project, setProjectId, base, setBase } = target;
  const { efforts, effort, setEffort } = useEffortChoice(choice);
  const attachments = useAttachmentDraft();
  const [planWanted, setPlan] = useState(false);
  const [text, setText] = useState("");
  const [starting, setStarting] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);

  const planAvailable = canPlanFirst(choice.kind);
  const plan = planWanted && planAvailable;
  const ready = text.trim().length > 0 && !starting && project !== undefined;
  const dropping = !project && setup.dragging;

  useEffect(() => input.current?.focus(), [preset]);

  const submit = () => {
    if (!ready || !base) return;
    setStarting(true);
    void startTask({
      projectId: project.id,
      prompt: text.trim(),
      base,
      kind: choice.kind,
      model: choice.model,
      mode: plan ? "plan" : "auto",
      effort: efforts.length > 0 ? effort : null,
      files: attachments.files,
    }).finally(() => setStarting(false));
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return {
    input,
    placeholder: project ? `Give Interlock a task in ${project.name}` : setup.prompt,
    dropping,
    highlighted: attachments.dragging || dropping,
    setupError: project ? null : setup.error,
    project,
    setProjectId,
    base,
    setBase,
    plan,
    planAvailable,
    setPlan,
    efforts,
    effort,
    setEffort,
    text,
    setText,
    attachments,
    ready,
    submit,
    onKeyDown,
  };
}
