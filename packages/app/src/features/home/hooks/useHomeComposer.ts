import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { projectOf, projects } from "@/mocks/projects";
import { useStore } from "@/stores/app-store";
import type { Effort } from "@/types";
import type { ModelChoice } from "@/features/home/types";

/** Everything the new-task composer holds, and starting the task from it. Enter sends; Shift+Enter adds a line. */
export function useHomeComposer(choice: ModelChoice) {
  const startTask = useStore((s) => s.startTask);
  const preset = useStore((s) => s.newTaskProjectId);
  const [projectId, setProjectId] = useState(preset ?? projects[0].id);
  const [seenPreset, setSeenPreset] = useState(preset);
  const [picked, setPicked] = useState<{ projectId: string; branch: string } | null>(null);
  const [plan, setPlan] = useState(false);
  const [effort, setEffort] = useState<Effort>("medium");
  const [text, setText] = useState("");
  const input = useRef<HTMLTextAreaElement>(null);

  // A "new task in <project>" request arriving while this page is already open switches the project.
  if (preset !== seenPreset) {
    setSeenPreset(preset);
    if (preset) setProjectId(preset);
  }

  const project = projectOf(projectId);
  // The worktree starts from the project's default branch unless you picked another one in this project.
  const base = picked?.projectId === projectId ? picked.branch : project.defaultBranch;

  useEffect(() => input.current?.focus(), [preset]);

  const submit = () => {
    const prompt = text.trim();
    if (!prompt) return;
    startTask({
      projectId,
      prompt,
      base,
      kind: choice.kind,
      model: choice.model,
      mode: plan ? "plan" : "auto",
      effort,
    });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const setBase = (branch: string) => setPicked({ projectId, branch });

  /** Starts the prompt with a skill, as plain text you can edit or delete, replacing a skill already there. */
  const addSkill = (skill: string) => {
    const next = `/${skill} ${text.replace(/^\/\S+\s*/, "")}`;
    setText(next);
    requestAnimationFrame(() => {
      input.current?.focus();
      input.current?.setSelectionRange(next.length, next.length);
    });
  };

  return {
    input,
    project,
    setProjectId,
    base,
    setBase,
    plan,
    setPlan,
    effort,
    setEffort,
    text,
    setText,
    submit,
    onKeyDown,
    addSkill,
  };
}
