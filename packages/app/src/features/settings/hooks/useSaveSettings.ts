import { useEffect, useState } from "react";
import { useStore } from "@/stores/app-store";
import type { ProjectSettings } from "@/types";

export type SaveStatus = "idle" | "saving" | "saved" | "failed";

const SAVED_FOR_MS = 1800;

/** Saves a change of settings and reports it as a state a section can show quietly in its header. */
export function useSaveSettings(projectId: string) {
  const updateSettings = useStore((s) => s.updateSettings);
  const reportError = useStore((s) => s.reportError);
  const [status, setStatus] = useState<SaveStatus>("idle");

  useEffect(() => {
    if (status !== "saved") return;
    const timer = setTimeout(() => setStatus("idle"), SAVED_FOR_MS);
    return () => clearTimeout(timer);
  }, [status]);

  const save = async (change: Partial<ProjectSettings>) => {
    setStatus("saving");
    try {
      await updateSettings(projectId, change);
      setStatus("saved");
    } catch (error) {
      reportError(error);
      setStatus("failed");
    }
  };

  return { status, save };
}
