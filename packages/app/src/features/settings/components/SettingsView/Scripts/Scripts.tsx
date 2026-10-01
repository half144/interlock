import type { Project } from "@/types";
import { Input } from "@/components/ui/Input/Input";
import { CodeArea } from "@/features/settings/components/CodeArea/CodeArea";
import { Row } from "@/features/settings/components/Row/Row";
import { Section } from "@/features/settings/components/Section/Section";

export function Scripts({ project }: { project: Project }) {
  return (
    <Section
      id="scripts"
      title="Scripts"
      description="Commands Interlock runs for you in every worktree of this project."
    >
      <Row
        stack
        label="Setup script"
        hint="Runs in each new worktree before the agent starts. $ROOT is the main checkout."
      >
        <CodeArea rows={4} defaultValue={project.setupScript} aria-label="Setup script" />
      </Row>
      <Row stack label="Run script" hint="Powers the Run button and the Preview tab.">
        <Input mono className="w-full" defaultValue={project.runScript} aria-label="Run script" />
      </Row>
      <Row
        label="Base port"
        hint="Each worktree takes the next free port from here, so previews never collide."
      >
        <Input
          mono
          className="w-28"
          defaultValue={project.port}
          inputMode="numeric"
          aria-label="Base port"
        />
      </Row>
    </Section>
  );
}
