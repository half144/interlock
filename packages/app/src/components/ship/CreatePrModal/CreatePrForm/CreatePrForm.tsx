import type { ReactNode } from "react";
import type { Agent } from "@/types";
import { DiffStat } from "@/components/ui/DiffStat/DiffStat";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { monoText } from "@/lib/styles";
import { plural } from "@/lib/utils";

interface CreatePrFormProps {
  agent: Agent;
  title: string;
  remote: string | null;
  onTitle: (title: string) => void;
  onSubmit: () => void;
}

/** What is about to be opened: the title (editable), the branch it goes from and to, and what it carries. */
export function CreatePrForm({ agent, title, remote, onTitle, onSubmit }: CreatePrFormProps) {
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <Field label="Title">
        <Input value={title} onChange={(event) => onTitle(event.target.value)} />
      </Field>
      <dl className="flex flex-col gap-2 text-[13px]">
        <Row term="Branch">
          <span className={monoText}>{agent.branch}</span>
          <span className="text-ink-3">into</span>
          <span className={monoText}>{agent.base}</span>
        </Row>
        <Row term="Changes">
          <span className="text-ink-2">{plural(agent.files.length, "file")}</span>
          <DiffStat additions={agent.additions} deletions={agent.deletions} />
        </Row>
        {remote && (
          <Row term="Remote">
            <span className={monoText}>{remote}</span>
          </Row>
        )}
      </dl>
      <p className="text-[12.5px] leading-[1.5] text-ink-3">
        Anything not yet committed is committed first, then the branch is pushed and the pull
        request opened with the GitHub CLI.
      </p>
    </form>
  );
}

function Row({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <dt className="w-16 shrink-0 text-ink-3">{term}</dt>
      <dd className="flex min-w-0 items-center gap-1.5">{children}</dd>
    </div>
  );
}
