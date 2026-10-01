import { Button } from "@/components/ui/Button/Button";
import { Modal } from "@/components/ui/Modal/Modal";
import { useDeleteTaskDialog } from "./useDeleteTaskDialog";

export function DeleteTaskDialog({ agentId, onClose }: { agentId: string; onClose: () => void }) {
  const { branch, isWorktree, deleting, confirm } = useDeleteTaskDialog(agentId, onClose);

  return (
    <Modal
      title="Delete this task?"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" disabled={deleting} onClick={confirm}>
            {deleting ? "Deleting…" : "Delete task"}
          </Button>
        </>
      }
    >
      <p className="text-[14px] leading-[1.6] text-ink-2">
        {isWorktree ? (
          <>
            The agent stops, and its worktree and the branch{" "}
            <span className="font-mono text-[12.5px] text-ink">{branch}</span> are deleted from this
            computer. Changes that are not on a pull request are lost.
          </>
        ) : (
          "The agent stops and the conversation is removed. Files in the project folder are not touched."
        )}
      </p>
    </Modal>
  );
}
