import { GitBranch } from "lucide-react";
import { DiffStat } from "@/components/ui/DiffStat/DiffStat";
import { cn } from "@/lib/utils";

const LINES = [
  { sign: "−", text: "if (!user) return null", wash: "bg-del/10", mark: "text-del" },
  { sign: "+", text: "if (!session) return login()", wash: "bg-add/10", mark: "text-add" },
  { sign: " ", text: "return render(page)", wash: "", mark: "" },
];

/** A small drawing of Interlock's own review: a task's branch, its diff, and the button that ships it. */
export function FlowPreview() {
  return (
    <div aria-hidden className="relative w-[256px] shrink-0">
      <div className="absolute top-5 left-0 w-[236px] rounded-xl border border-seam bg-raised shadow-card">
        <div className="flex items-center gap-1.5 border-b border-seam px-3 py-2 font-mono text-[10.5px] text-ink-3">
          <GitBranch className="size-3 shrink-0" />
          <span className="truncate">agent/fix-session</span>
          <DiffStat additions={12} deletions={3} className="ml-auto text-[10.5px]" />
        </div>
        <div className="py-1.5 font-mono text-[10.5px] leading-[18px] text-ink-2">
          {LINES.map((line) => (
            <div key={line.text} className={cn("flex gap-2 px-3", line.wash)}>
              <span className={cn("w-2 shrink-0", line.mark)}>{line.sign}</span>
              <span className="truncate">{line.text}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-end px-3 pt-1 pb-3">
          <span className="rounded-md bg-ink-2 px-2.5 py-1 text-[11px] font-medium text-ground">
            Create PR
          </span>
        </div>
      </div>
    </div>
  );
}
