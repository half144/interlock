import type { Project } from "@/types";
import { pressable } from "@/lib/styles";
import { cn } from "@/lib/utils";

/**
 * The project's own skills, as Cursor offers ready tasks under its composer. Picking one only writes
 * `/skill` at the start of the prompt, so it stays plain text you can edit or delete.
 */
export function SkillSuggestions({
  project,
  onPick,
}: {
  project: Project;
  onPick: (skill: string) => void;
}) {
  if (!project.skills.length) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 px-2">
      <span className="mr-1 text-[12.5px] text-ink-3">Skills in {project.name}</span>
      {project.skills.map((skill) => (
        <button
          key={skill}
          type="button"
          title={`Start the prompt with /${skill}`}
          onClick={() => onPick(skill)}
          className={cn(
            "h-7 rounded-full border border-seam px-3 font-mono text-[12px] text-ink-2 hover:bg-hover hover:text-ink active:scale-[0.97]",
            pressable,
          )}
        >
          /{skill}
        </button>
      ))}
    </div>
  );
}
