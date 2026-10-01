import { useState } from "react";
import { useStore } from "@/stores/app-store";

export function useDeleteTaskDialog(agentId: string, onClose: () => void) {
  const deleteTask = useStore((s) => s.deleteTask);
  const agent = useStore((s) => s.agents[agentId]);
  const isWorktree = useStore((s) =>
    agent?.workspaceId ? s.workspaces[agent.workspaceId]?.isWorktree : false,
  );
  const [deleting, setDeleting] = useState(false);

  const confirm = () => {
    setDeleting(true);
    void deleteTask(agentId).finally(() => {
      setDeleting(false);
      onClose();
    });
  };

  return { branch: agent?.branch, isWorktree: isWorktree === true, deleting, confirm };
}
