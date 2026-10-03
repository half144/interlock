import { useState } from "react";
import type { ChangeEvent, SyntheticEvent } from "react";
import type { AuthProvider, ToolStatus } from "@/types";
import { useStore } from "@/stores/app-store";

export function useExecutableField(tool: ToolStatus & { id: AuthProvider }) {
  const saveExecutable = useStore((s) => s.saveExecutable);
  const login = useStore((s) => s.login);
  const [draft, setDraft] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const value = draft ?? tool.executable;
  const dirty = value.trim() !== tool.executable;
  const busy = saving || login.phase === "starting" || login.phase === "waiting";
  const canSave = dirty && value.trim().length > 0 && !busy;

  return {
    value,
    dirty,
    busy,
    saving,
    canSave,
    error,
    saved,
    change: (event: ChangeEvent<HTMLInputElement>) => {
      setDraft(event.target.value);
      setError(null);
      setSaved(false);
    },
    save: async (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!canSave) return;
      setSaving(true);
      setError(null);
      try {
        await saveExecutable(tool.id, value.trim());
        setDraft(null);
        setSaved(true);
      } catch (failure) {
        setError(failure instanceof Error ? failure.message : String(failure));
      } finally {
        setSaving(false);
      }
    },
  };
}
