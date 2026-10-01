import { useState } from "react";
import { Plus } from "lucide-react";
import { mcpToolCounts } from "@/mocks/settings";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button/Button";
import { monoText } from "@/lib/styles";
import { Toggle } from "@/components/ui/Toggle/Toggle";
import { Row } from "@/features/settings/components/Row/Row";
import { Section } from "@/features/settings/components/Section/Section";

export function Integrations({ project }: { project: Project }) {
  const [on, setOn] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(project.mcp.map((m) => [m, true])),
  );

  return (
    <Section
      id="mcp"
      title="MCP & skills"
      description="Tools and instructions every agent in this project starts with. Each worktree gets its own MCP session."
    >
      {project.mcp.map((name) => {
        const enabled = on[name] ?? true;
        return (
          <Row
            key={name}
            label={
              <span className="flex items-center gap-2.5">
                <span
                  className={cn("size-1.5 rounded-full", enabled ? "bg-green" : "bg-ink-4")}
                  aria-hidden
                />
                <span className={monoText}>{name}</span>
              </span>
            }
            hint={enabled ? `Connected · ${mcpToolCounts[name] ?? 10} tools` : "Disconnected"}
          >
            <Toggle
              label={`${enabled ? "Disable" : "Enable"} ${name}`}
              checked={enabled}
              onChange={(v) => setOn((s) => ({ ...s, [name]: v }))}
            />
          </Row>
        );
      })}
      <Row stack label="Skills" hint="Loaded when a task matches their description.">
        <div className="flex flex-wrap items-center gap-1.5">
          {project.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex h-7 items-center rounded-full border border-seam-2 px-3 font-mono text-[12px] text-ink-2"
            >
              {skill}
            </span>
          ))}
          <Button variant="ghost" size="sm" icon={<Plus />}>
            Add skill
          </Button>
        </div>
      </Row>
    </Section>
  );
}
