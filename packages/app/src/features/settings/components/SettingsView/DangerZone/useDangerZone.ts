import { useState } from "react";
import { useStore } from "@/stores/app-store";

export function useDangerZone(projectId: string) {
  const deleteProject = useStore((s) => s.deleteProject);
  const [removing, setRemoving] = useState(false);
  const [busy, setBusy] = useState(false);

  return {
    removing,
    busy,
    ask: () => setRemoving(true),
    cancel: () => setRemoving(false),
    confirm: async () => {
      setBusy(true);
      await deleteProject(projectId);
      setBusy(false);
      setRemoving(false);
    },
  };
}
