import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { RemoveProjectModal } from "./RemoveProjectModal/RemoveProjectModal";
import { useDangerZone } from "./useDangerZone";

export function DangerZone({ projectId, name }: { projectId: string; name: string }) {
  const { removing, busy, ask, cancel, confirm } = useDangerZone(projectId);

  return (
    <section id="danger" aria-labelledby="danger-title" className="scroll-mt-6 pt-10">
      <h2 id="danger-title" className="text-[15px] font-medium tracking-[-0.01em] text-ink">
        Danger zone
      </h2>
      <div className="mt-4 flex items-center gap-6 rounded-lg border border-red/25 bg-red/[0.03] px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-ink">Remove project from Interlock</p>
          <p className="mt-0.5 text-[12.5px] text-ink-3">
            Stops its agents and takes its tasks off the list. The folder stays on disk, untouched.
          </p>
        </div>
        <Button variant="danger" icon={<Trash2 />} onClick={ask}>
          Remove project
        </Button>
      </div>
      {removing && (
        <RemoveProjectModal
          name={name}
          busy={busy}
          onConfirm={() => void confirm()}
          onClose={cancel}
        />
      )}
    </section>
  );
}
