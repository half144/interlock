import type { Agent } from "@/types";
import { Button } from "@/components/ui/Button/Button";
import { Modal } from "@/components/ui/Modal/Modal";
import { useDiscardDialog } from "./useDiscardDialog";

export function DiscardDialog({ agent, onClose }: { agent: Agent; onClose: () => void }) {
  const { discarding, confirm } = useDiscardDialog(agent.id, onClose);

  return (
    <Modal
      title="Discard this task?"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" disabled={discarding} onClick={confirm}>
            {discarding ? "Discarding…" : "Discard task"}
          </Button>
        </>
      }
    >
      <p className="text-[14px] leading-[1.6] text-ink-2">
        The agent stops, and its worktree and the branch{" "}
        <span className="font-mono text-[12.5px] text-ink">{agent.branch}</span> are deleted from
        this computer. Changes that are not on a pull request are lost.
      </p>
    </Modal>
  );
}
