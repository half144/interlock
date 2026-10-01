import { useState } from "react";
import { pickFolder } from "@/platform/desktop";
import { useFolderDrop } from "@/platform/hooks/useFolderDrop";
import { useStore } from "@/stores/app-store";
import { folderName } from "@/features/home/utils/repositories";

const PROMPT = "Give Interlock a task, then choose the folder it runs in";

/**
 * Adds the first project from the folder picker, a folder dropped on the window or a repository found on disk.
 * Drops are only taken while `enabled`, so they can't compete with a project composer's attachments.
 */
export function useAddProject(enabled: boolean) {
  const tryAddProject = useStore((s) => s.tryAddProject);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  const add = async (path: string) => {
    if (adding) return;
    setAdding(path);
    setError(await tryAddProject(path));
    setAdding(null);
  };

  const pick = async () => {
    try {
      const path = await pickFolder();
      if (path) await add(path);
      else setError(null);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not open the folder picker.");
    }
  };

  const dragging = useFolderDrop(enabled, (path) => void add(path));

  let prompt = PROMPT;
  if (adding) prompt = `Adding ${folderName(adding)}…`;
  else if (dragging) prompt = `Drop to add ${folderName(dragging)}`;

  return {
    prompt,
    dragging: dragging !== null,
    adding,
    error,
    pick: () => void pick(),
    add: (path: string) => void add(path),
  };
}

export type ProjectSetup = ReturnType<typeof useAddProject>;
