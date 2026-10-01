import { Wand2 } from "lucide-react";
import type { Project } from "@/types";
import { Button } from "@/components/ui/Button/Button";
import { CodeArea } from "@/features/settings/components/CodeArea/CodeArea";
import { Row } from "@/features/settings/components/Row/Row";
import { SavedMark } from "@/features/settings/components/SavedMark/SavedMark";
import { Section } from "@/features/settings/components/Section/Section";
import { useScripts } from "./useScripts";

export function Scripts({ project }: { project: Project }) {
  const scripts = useScripts(project);

  return (
    <Section
      id="scripts"
      title="Scripts"
      description="Commands Interlock runs in every new worktree of this project, before the agent starts."
      aside={<SavedMark status={scripts.status} />}
    >
      <Row
        stack
        label="Setup commands"
        hint="One command per line, run in order from the worktree root. A failing command stops the setup."
      >
        <CodeArea
          rows={4}
          value={scripts.text}
          placeholder="npm ci"
          aria-label="Setup commands"
          onChange={(e) => scripts.edit(e.target.value)}
          onBlur={scripts.flush}
        />
        <div className="mt-2 flex items-center gap-3">
          <Button size="sm" icon={<Wand2 />} onClick={() => void scripts.suggest()}>
            Suggest from lockfile
          </Button>
          {scripts.note && <p className="text-[12.5px] text-ink-3">{scripts.note}</p>}
        </div>
      </Row>
    </Section>
  );
}
