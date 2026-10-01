import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";

export function DangerZone() {
  return (
    <section aria-labelledby="danger-title" className="pt-10">
      <h2 id="danger-title" className="text-[15px] font-medium tracking-[-0.01em] text-ink">
        Danger zone
      </h2>
      <div className="mt-4 flex items-center gap-6 rounded-lg border border-red/25 bg-red/[0.03] px-4 py-3.5">
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-ink">Remove project from Interlock</p>
          <p className="mt-0.5 text-[12.5px] text-ink-3">
            Stops its agents and deletes their worktrees. The repository and its branches are not
            touched.
          </p>
        </div>
        <Button variant="danger" icon={<Trash2 />}>
          Remove project
        </Button>
      </div>
    </section>
  );
}
