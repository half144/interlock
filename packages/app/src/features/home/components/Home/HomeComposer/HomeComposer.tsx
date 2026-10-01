import { Mic, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComposerFrame } from "@/components/ui/ComposerFrame/ComposerFrame";
import { RoundButton } from "@/components/ui/RoundButton/RoundButton";
import { SendButton } from "@/components/ui/SendButton/SendButton";
import { EffortPicker } from "@/components/effort/EffortPicker/EffortPicker";
import { useHomeComposer } from "@/features/home/hooks/useHomeComposer";
import type { ModelChoice } from "@/features/home/types";
import { ProjectPill } from "./ProjectPill/ProjectPill";
import { SkillSuggestions } from "./SkillSuggestions/SkillSuggestions";
import { WorktreeTray } from "./WorktreeTray/WorktreeTray";

/** The new-task composer: the prompt, which project and branch it runs from, how hard to think, and the project's skills. */
export function HomeComposer({ choice }: { choice: ModelChoice }) {
  const c = useHomeComposer(choice);

  return (
    <div className="mt-8">
      <ComposerFrame className="relative z-10">
        <textarea
          ref={c.input}
          value={c.text}
          onChange={(e) => c.setText(e.target.value)}
          onKeyDown={c.onKeyDown}
          rows={2}
          placeholder={`Give Interlock a task in ${c.project.name}`}
          className="block w-full resize-none bg-transparent px-5 pt-4 pb-1 text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-4"
        />
        <div className="flex items-center gap-1.5 px-3 pb-3">
          <RoundButton label="Add files" variant="outline">
            <Plus />
          </RoundButton>
          <ProjectPill project={c.project} onChange={c.setProjectId} />
          <span className="ml-auto flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => c.setPlan((p) => !p)}
              aria-pressed={c.plan}
              className={cn(
                "h-8 rounded-full px-3 text-[13px] transition-colors",
                c.plan ? "bg-selected text-ink" : "text-ink-3 hover:bg-hover hover:text-ink-2",
              )}
            >
              Plan first
            </button>
            <EffortPicker value={c.effort} onChange={c.setEffort} model={choice.model} />
            <RoundButton label="Dictate">
              <Mic />
            </RoundButton>
            <SendButton label="Start task" onClick={c.submit} disabled={!c.text.trim()} />
          </span>
        </div>
      </ComposerFrame>

      <WorktreeTray project={c.project} base={c.base} onBase={c.setBase} />
      <SkillSuggestions project={c.project} onPick={c.addSkill} />
    </div>
  );
}
