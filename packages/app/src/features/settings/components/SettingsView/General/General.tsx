import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/Toggle/Toggle";
import { optionsOf } from "@/lib/options";
import { Picker } from "@/components/ui/Picker/Picker";
import { monoText } from "@/lib/styles";
import { Row } from "@/features/settings/components/Row/Row";
import { SavedMark } from "@/features/settings/components/SavedMark/SavedMark";
import { Section } from "@/features/settings/components/Section/Section";
import { useGeneral } from "./useGeneral";

export function General({ project }: { project: Project }) {
  const { status, branches, pickBranch, setArchive } = useGeneral(project);

  return (
    <Section
      id="general"
      title="General"
      description="Where this project lives and which branch new tasks start from."
      aside={<SavedMark status={status} />}
    >
      <Row label="Repository" hint={project.remoteUrl ?? "No remote is set for this repository."}>
        <span
          className={cn("max-w-[320px] truncate text-ink-2", monoText)}
          title={project.rootPath}
        >
          {project.rootPath}
        </span>
      </Row>
      <Row
        label="Default branch"
        hint="New tasks branch from here unless you pick another base. Remembered in this window."
      >
        <div className="w-52">
          <Picker
            label="Default branch"
            mono
            value={project.defaultBranch}
            options={optionsOf(branches)}
            onChange={pickBranch}
          />
        </div>
      </Row>
      <Row
        label="Archive after merge"
        hint="Removes the worktree once its PR merges. The branch stays on the remote."
      >
        <Toggle
          label="Archive worktrees after merge"
          checked={project.settings.archiveAfterMerge}
          onChange={setArchive}
        />
      </Row>
    </Section>
  );
}
