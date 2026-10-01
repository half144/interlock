import { useState } from "react";
import { useStore } from "@/stores/app-store";
import { usePullRequest } from "@/hooks/usePullRequest";
import { remoteLabel } from "@/lib/remote";
import { accessNote, shipFailureNote } from "@/lib/shipFailure";
import type { Agent } from "@/types";

function submitLabel(creating: boolean, failed: boolean) {
  if (creating) return "Creating…";
  return failed ? "Try again" : "Create pull request";
}

export function useCreatePrModal(agent: Agent, onCreated: () => void) {
  const createPullRequest = useStore((s) => s.createPullRequest);
  const remoteUrl = useStore((s) => s.workspaces[agent.workspaceId ?? ""]?.remoteUrl ?? null);
  const { access } = usePullRequest(agent);
  const [title, setTitle] = useState(agent.title);
  const [creating, setCreating] = useState(false);
  const [failure, setFailure] = useState<ReturnType<typeof shipFailureNote> | null>(null);

  const trimmed = title.trim();

  const submit = async () => {
    if (!trimmed || creating) return;
    setCreating(true);
    setFailure(null);
    const result = await createPullRequest(agent.id, trimmed);
    if (result.ok) {
      onCreated();
      return;
    }
    setFailure(shipFailureNote(result.error));
    setCreating(false);
  };

  return {
    title,
    setTitle,
    canSubmit: trimmed.length > 0,
    creating,
    submit,
    submitLabel: submitLabel(creating, failure !== null),
    note: failure ?? accessNote(access),
    detail: failure?.detail,
    remote: remoteUrl ? remoteLabel(remoteUrl) : null,
  };
}
