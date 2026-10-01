import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import { monoText } from "@/lib/styles";
import { Row } from "@/features/settings/components/Row/Row";
import { Section } from "@/features/settings/components/Section/Section";

/** A plain folder has no branches or merges, so General only says where the project lives and what that means. */
export function FolderGeneral({ project }: { project: Project }) {
  return (
    <Section id="general" title="General" description="Where this project lives.">
      <Row
        label="Folder"
        hint="Not a git repository: tasks run in this folder itself, with no worktree, branch, diff or pull request. Run git init in it and Interlock picks that up."
      >
        <span
          className={cn("max-w-[320px] truncate text-ink-2", monoText)}
          title={project.rootPath}
        >
          {project.rootPath}
        </span>
      </Row>
    </Section>
  );
}
