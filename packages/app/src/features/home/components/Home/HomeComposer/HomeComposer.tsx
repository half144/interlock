import { cn } from "@/lib/utils";
import { ComposerFrame } from "@/components/ui/ComposerFrame/ComposerFrame";
import { SendButton } from "@/components/ui/SendButton/SendButton";
import { AddFilesButton } from "@/components/attachments/AddFilesButton/AddFilesButton";
import { AttachmentChips } from "@/components/attachments/AttachmentChips/AttachmentChips";
import { EffortPicker } from "@/components/effort/EffortPicker/EffortPicker";
import type { ProjectChoice } from "@/features/home/hooks/useProjectChoice";
import type { ModelChoice } from "@/features/home/types";
import { AddProject } from "./AddProject/AddProject";
import { PlanFirstToggle } from "./PlanFirstToggle/PlanFirstToggle";
import { ProjectPill } from "./ProjectPill/ProjectPill";
import { useHomeComposer } from "./useHomeComposer";
import { WorktreeTray } from "./WorktreeTray/WorktreeTray";

export function HomeComposer({ choice, target }: { choice: ModelChoice; target: ProjectChoice }) {
  const c = useHomeComposer(choice, target);
  const { project, base, attachments } = c;
  if (!project || !base) return <AddProject />;

  return (
    <div className="mt-8">
      <ComposerFrame
        className={cn("relative z-10", attachments.dragging && "ring-1 ring-run/60")}
        {...attachments.dropTarget}
      >
        <AttachmentChips items={attachments.items} onRemove={attachments.remove} />
        <textarea
          ref={c.input}
          value={c.text}
          onChange={(e) => c.setText(e.target.value)}
          onKeyDown={c.onKeyDown}
          onPaste={attachments.onPaste}
          rows={2}
          placeholder={`Give Interlock a task in ${project.name}`}
          className="block w-full resize-none bg-transparent px-5 pt-4 pb-1 text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-4"
        />
        <div className="flex items-center gap-1.5 px-3 pb-3">
          <AddFilesButton onPick={attachments.add} />
          <ProjectPill project={project} onChange={c.setProjectId} />
          <span className="ml-auto flex items-center gap-1.5">
            <PlanFirstToggle
              pressed={c.plan}
              onToggle={() => c.setPlan((p) => !p)}
              {...(c.planAvailable
                ? {}
                : { disabledReason: "Plan first is not available for this agent" })}
            />
            <EffortPicker
              value={c.effort}
              options={c.efforts}
              onChange={c.setEffort}
              model={choice.model}
            />
            <SendButton label="Start task" onClick={c.submit} disabled={!c.ready} />
          </span>
        </div>
      </ComposerFrame>

      <WorktreeTray project={project} base={base} onBase={c.setBase} />
    </div>
  );
}
