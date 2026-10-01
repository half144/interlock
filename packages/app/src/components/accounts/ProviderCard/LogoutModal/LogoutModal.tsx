import { Button } from "@/components/ui/Button/Button";
import { Modal } from "@/components/ui/Modal/Modal";

interface LogoutModalProps {
  name: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function LogoutModal({ name, onConfirm, onClose }: LogoutModalProps) {
  return (
    <Modal
      title={`Log out of ${name}?`}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Log out
          </Button>
        </>
      }
    >
      <p className="text-[13.5px] leading-[1.55] text-ink-2 [text-wrap:pretty]">
        This signs the {name} command line out on this Mac, so it also affects its use outside
        Interlock. Tasks that use it will stop working until you log in again.
      </p>
    </Modal>
  );
}
