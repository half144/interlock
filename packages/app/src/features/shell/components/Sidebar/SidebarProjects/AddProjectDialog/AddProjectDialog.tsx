import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { Modal } from "@/components/ui/Modal/Modal";
import { useAddProjectDialog } from "./useAddProjectDialog";

interface AddProjectDialogProps {
  initialPath: string;
  error: string | null;
  onSubmit: (path: string) => Promise<void>;
  onClose: () => void;
}

/** Where the native folder picker is missing (the browser), the path is typed instead. */
export function AddProjectDialog({ initialPath, error, onSubmit, onClose }: AddProjectDialogProps) {
  const { path, setPath, busy, canSubmit, submit } = useAddProjectDialog(initialPath, onSubmit);

  return (
    <Modal
      title="Add project"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" form="add-project" disabled={!canSubmit}>
            {busy ? "Adding…" : "Add project"}
          </Button>
        </>
      }
    >
      <form id="add-project" onSubmit={submit} className="flex flex-col gap-3">
        <Field label="Folder path">
          <Input
            mono
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/Users/you/code/my-repo"
            aria-invalid={error ? true : undefined}
          />
        </Field>
        <p className="text-[13px] text-ink-3">The folder must be a git repository.</p>
        {error && (
          <p role="alert" className="text-[13px] text-red">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
