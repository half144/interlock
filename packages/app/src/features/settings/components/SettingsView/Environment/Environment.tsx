import { Plus } from "lucide-react";
import type { Project } from "@/types";
import { Button } from "@/components/ui/Button/Button";
import { monoText } from "@/lib/styles";
import { CodeArea } from "@/features/settings/components/CodeArea/CodeArea";
import { Row } from "@/features/settings/components/Row/Row";
import { SavedMark } from "@/features/settings/components/SavedMark/SavedMark";
import { Section } from "@/features/settings/components/Section/Section";
import { EnvRowItem } from "./EnvRowItem/EnvRowItem";
import { useEnvironment } from "./useEnvironment";

export function Environment({ project }: { project: Project }) {
  const env = useEnvironment(project);

  return (
    <Section
      id="environment"
      title="Environment"
      description="Variables injected into setup and agent shells in every worktree, and files copied into each new one."
      aside={<SavedMark status={env.status} />}
    >
      <div className="py-2">
        {env.vars.length === 0 && (
          <p className="px-4 py-2 text-[13px] text-ink-3">No variables yet.</p>
        )}
        {env.vars.map((variable) => (
          <EnvRowItem
            key={variable.id}
            variable={variable}
            revealed={env.revealed.has(variable.id)}
            onChange={(patch) => env.change(variable.id, patch)}
            onToggle={() => env.toggle(variable.id)}
            onRemove={() => env.remove(variable.id)}
            onBlur={env.flushVars}
          />
        ))}
        {env.nameError && (
          <p role="alert" className="px-4 pt-1 text-[12.5px] text-red">
            <span className={monoText}>{env.nameError}</span> is not a valid name. Use letters,
            digits and underscores, not starting with a digit.
          </p>
        )}
        <div className="px-3 pt-1.5">
          <Button size="sm" variant="ghost" icon={<Plus />} onClick={env.add}>
            Add variable
          </Button>
        </div>
      </div>
      <Row
        stack
        label="Files to copy"
        hint="One path per line, relative to the repo. Copied from the main checkout into every new worktree."
      >
        <CodeArea
          rows={3}
          value={env.filesText}
          placeholder=".env.local"
          aria-label="Files to copy"
          aria-invalid={env.pathError ? true : undefined}
          onChange={(e) => env.editFiles(e.target.value)}
          onBlur={env.flushFiles}
        />
        {env.pathError && (
          <p role="alert" className="mt-2 text-[12.5px] text-red">
            <span className={monoText}>{env.pathError}</span> is outside the repo. Use a path inside
            it.
          </p>
        )}
      </Row>
      <Row
        label={<span className={monoText}>.worktreeinclude</span>}
        hint="Interlock also honours this file at the repo root: matching gitignored files are copied into every new worktree."
      >
        <span className={`max-w-[320px] truncate text-ink-3 ${monoText}`}>
          {env.included.length > 0 ? env.included.join("  ") : "Not found"}
        </span>
      </Row>
    </Section>
  );
}
