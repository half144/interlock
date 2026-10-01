import { useState } from "react";
import { ExternalLink } from "lucide-react";
import { branches } from "@/mocks/settings";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";
import { Toggle } from "@/components/ui/Toggle/Toggle";
import { Input } from "@/components/ui/Input/Input";
import { optionsOf } from "@/lib/options";
import { Picker } from "@/components/ui/Picker/Picker";
import { monoText } from "@/lib/styles";
import { Row } from "@/features/settings/components/Row/Row";
import { Section } from "@/features/settings/components/Section/Section";

export function General({ project }: { project: Project }) {
  const [branch, setBranch] = useState(project.defaultBranch);
  const [archive, setArchive] = useState(true);

  return (
    <Section
      id="general"
      title="General"
      description="Where this project lives and how Interlock names the worktrees it creates."
    >
      <Row label="Repository">
        <a
          href={`https://github.com/${project.repo}`}
          target="_blank"
          rel="noreferrer"
          className={cn(
            "inline-flex h-8 items-center gap-2 rounded-md px-2 text-ink-2 transition-colors duration-150 hover:bg-hover hover:text-ink",
            monoText,
          )}
        >
          github.com/{project.repo}
          <ExternalLink className="size-3.5 text-ink-3" />
        </a>
      </Row>
      <Row label="Default branch" hint="New tasks branch from here unless you pick another base.">
        <div className="w-52">
          <Picker
            label="Default branch"
            mono
            value={branch}
            options={optionsOf(branches)}
            onChange={setBranch}
          />
        </div>
      </Row>
      <Row label="Worktree root" hint="Each agent gets its own checkout under this folder.">
        <Input
          mono
          aria-label="Worktree root"
          className="w-[300px]"
          defaultValue={`~/.interlock/worktrees/${project.name}`}
        />
      </Row>
      <Row
        label="Branch prefix"
        hint="Branches are named prefix + agent ID + slug, e.g. agent/chk-41-session-refresh."
      >
        <Input mono aria-label="Branch prefix" className="w-28" defaultValue="agent/" />
      </Row>
      <Row
        label="Archive after merge"
        hint="Removes the worktree once its PR merges. The branch stays on the remote."
      >
        <Toggle label="Archive worktrees after merge" checked={archive} onChange={setArchive} />
      </Row>
    </Section>
  );
}
