import { useState } from "react";
import { pickFolder } from "@/platform/desktop";
import { useStore } from "@/stores/app-store";

export function useAddProject() {
  const tryAddProject = useStore((s) => s.tryAddProject);
  const [error, setError] = useState<string | null>(null);

  const add = async () => {
    try {
      const path = await pickFolder();
      setError(path ? await tryAddProject(path) : null);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Could not open the folder picker.");
    }
  };

  return { error, add: () => void add() };
}
