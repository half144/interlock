import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { envVars } from "@/mocks/settings";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/IconButton/IconButton";
import { monoText } from "@/lib/styles";
import { CodeArea } from "@/features/settings/components/CodeArea/CodeArea";
import { Row } from "@/features/settings/components/Row/Row";
import { Section } from "@/features/settings/components/Section/Section";

export function Environment({ project }: { project: Project }) {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const vars = envVars[project.id] ?? [];

  return (
    <Section
      id="environment"
      title="Environment"
      description="Injected into setup, run and agent shells in every worktree. Values here are demo placeholders."
    >
      {vars.map(([key, value]) => (
        <div key={key} className={cn("flex h-11 items-center gap-4 pr-2.5 pl-4", monoText)}>
          <span className="w-52 shrink-0 truncate text-ink">{key}</span>
          <span className="min-w-0 flex-1 truncate text-ink-3">
            {revealed[key] ? value : "•".repeat(18)}
          </span>
          <IconButton
            label={revealed[key] ? `Hide ${key}` : `Reveal ${key}`}
            onClick={() => setRevealed((r) => ({ ...r, [key]: !r[key] }))}
          >
            {revealed[key] ? <EyeOff /> : <Eye />}
          </IconButton>
        </div>
      ))}
      <Row
        stack
        label={<span className={monoText}>.worktreeinclude</span>}
        hint="Gitignored files copied from the main checkout into every new worktree."
      >
        <CodeArea
          rows={3}
          defaultValue={".env.local\n.env.test\ncerts/dev/*.pem"}
          aria-label=".worktreeinclude patterns"
        />
      </Row>
    </Section>
  );
}
