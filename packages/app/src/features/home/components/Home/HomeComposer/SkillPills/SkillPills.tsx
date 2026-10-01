import type { Skill } from "@/types";
import { pressable } from "@/lib/styles";
import { cn } from "@/lib/utils";

export function SkillPills({
  skills,
  onPick,
}: {
  skills: Skill[];
  onPick: (name: string) => void;
}) {
  if (skills.length === 0) return null;
  return (
    <ul aria-label="Skills" className="mt-4 flex flex-wrap justify-center gap-2">
      {skills.map((skill) => (
        <li key={skill.name}>
          <button
            type="button"
            title={skill.description}
            onClick={() => onPick(skill.name)}
            className={cn(
              pressable,
              "h-7 rounded-full border border-seam px-3 font-mono text-[12px] text-ink-2 hover:bg-hover hover:text-ink active:scale-[0.97]",
            )}
          >
            /{skill.name}
          </button>
        </li>
      ))}
    </ul>
  );
}
