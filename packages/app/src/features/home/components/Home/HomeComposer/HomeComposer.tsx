import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { fadeIn, spring } from "@/lib/motion";
import { ComposerFrame } from "@/components/ui/ComposerFrame/ComposerFrame";
import { SendButton } from "@/components/ui/SendButton/SendButton";
import { AddFilesButton } from "@/components/attachments/AddFilesButton/AddFilesButton";
import { AttachmentChips } from "@/components/attachments/AttachmentChips/AttachmentChips";
import { EffortPicker } from "@/components/effort/EffortPicker/EffortPicker";
import type { ProjectSetup } from "@/features/home/hooks/useAddProject";
import type { ProjectChoice } from "@/features/home/hooks/useProjectChoice";
import type { ModelChoice } from "@/features/home/types";
import { ChooseRepositoryPill } from "./ChooseRepositoryPill/ChooseRepositoryPill";
import { PlanFirstToggle } from "./PlanFirstToggle/PlanFirstToggle";
import { ProjectPill } from "./ProjectPill/ProjectPill";
import { ProjectTray } from "./ProjectTray/ProjectTray";
import { SkillPills } from "./SkillPills/SkillPills";
import { useHomeComposer } from "./useHomeComposer";

/** The home composer. Before any project it is already the real one: what you type stays when a repository is added. */
export function HomeComposer({
  choice,
  target,
  setup,
}: {
  choice: ModelChoice;
  target: ProjectChoice;
  setup: ProjectSetup;
}) {
  const c = useHomeComposer(choice, target, setup);
  const { project, base, attachments } = c;

  return (
    <motion.div
      initial={project ? false : { opacity: 0, y: 8 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { y: spring, opacity: fadeIn, delay: 0.06 },
      }}
      className="mt-8"
    >
      <motion.div
        animate={{ scale: c.dropping ? 1.015 : 1 }}
        transition={spring}
        className="relative z-10"
      >
        <ComposerFrame
          className={cn(c.highlighted && "ring-1 ring-run/60")}
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
            placeholder={c.placeholder}
            className="block w-full resize-none bg-transparent px-5 pt-4 pb-1 text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-4"
          />
          <div className="flex items-center gap-1.5 px-3 pb-3">
            <AddFilesButton onPick={attachments.add} />
            {project ? (
              <ProjectPill project={project} onChange={c.setProjectId} />
            ) : (
              <ChooseRepositoryPill adding={setup.adding !== null} onPick={setup.pick} />
            )}
            <span className="ml-auto flex items-center gap-1.5">
              <PlanFirstToggle
                pressed={c.plan}
                onToggle={() => c.setPlan((p) => !p)}
                {...(c.planAvailable
                  ? {}
                  : {
                      disabledReason: "Plan first is not available for this agent",
                    })}
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
      </motion.div>

      <ProjectTray project={project} base={base} onBase={c.setBase} />
      <SkillPills skills={c.skills} onPick={c.pickSkill} />
      {c.setupError && (
        <p role="alert" className="mt-3 px-3 text-[13px] text-red">
          {c.setupError}
        </p>
      )}
    </motion.div>
  );
}
