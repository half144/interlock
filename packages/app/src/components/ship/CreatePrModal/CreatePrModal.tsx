import type { Agent } from "@/types";
import { Button } from "@/components/ui/Button/Button";
import { Modal } from "@/components/ui/Modal/Modal";
import { CreatePrForm } from "./CreatePrForm/CreatePrForm";
import { ShipFailure } from "./ShipFailure/ShipFailure";
import { useCreatePrModal } from "./useCreatePrModal";

interface CreatePrModalProps {
  agent: Agent;
  onClose: () => void;
  onCreated: () => void;
}

/** Confirms the pull request, creates it, and explains what to fix when GitHub or git says no. */
export function CreatePrModal({ agent, onClose, onCreated }: CreatePrModalProps) {
  const { title, setTitle, canSubmit, creating, submit, submitLabel, note, detail, remote, files } =
    useCreatePrModal(agent, onCreated);

  return (
    <Modal
      title="Create pull request"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!canSubmit || creating} onClick={() => void submit()}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <CreatePrForm
        agent={agent}
        files={files}
        title={title}
        remote={remote}
        onTitle={setTitle}
        onSubmit={() => void submit()}
      />
      {note && (
        <div className="mt-4">
          <ShipFailure note={note} detail={detail} />
        </div>
      )}
    </Modal>
  );
}
