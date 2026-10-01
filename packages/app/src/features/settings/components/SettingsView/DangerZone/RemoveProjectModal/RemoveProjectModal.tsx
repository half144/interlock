import { Button } from "@/components/ui/Button/Button";
import { Modal } from "@/components/ui/Modal/Modal";

interface RemoveProjectModalProps {
  name: string;
  busy: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function RemoveProjectModal({ name, busy, onConfirm, onClose }: RemoveProjectModalProps) {
  return (
    <Modal
      title={`Remove ${name}?`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" disabled={busy} onClick={onConfirm}>
            {busy ? "Removing…" : "Remove project"}
          </Button>
        </>
      }
    >
      <p className="text-[13.5px] leading-[1.55] text-ink-2 [text-wrap:pretty]">
        Interlock stops its running agents and takes its tasks off the list. The folder, its
        branches and your files stay exactly where they are, and you can add the project again
        later.
      </p>
    </Modal>
  );
}
