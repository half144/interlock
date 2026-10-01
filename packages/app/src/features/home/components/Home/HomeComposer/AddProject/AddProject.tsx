import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { useAddProject } from "./useAddProject";

export function AddProject() {
  const { error, add } = useAddProject();

  return (
    <div className="mt-8 flex flex-col items-center gap-3 text-center">
      <p className="text-[14px] text-ink-3">Add a git repository to start giving it tasks.</p>
      <Button variant="primary" icon={<FolderPlus />} onClick={add}>
        Add project
      </Button>
      {error && (
        <p role="alert" className="max-w-[420px] text-[13px] text-red">
          {error}
        </p>
      )}
    </div>
  );
}
