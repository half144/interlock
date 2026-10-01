import { TriangleAlert } from "lucide-react";
import type { Autonomy, Project } from "@/types";
import { Picker } from "@/components/ui/Picker/Picker";
import { Tabs } from "@/components/ui/Tabs/Tabs";
import { Row } from "@/features/settings/components/Row/Row";
import { SavedMark } from "@/features/settings/components/SavedMark/SavedMark";
import { Section } from "@/features/settings/components/Section/Section";
import { useAgentsSection } from "./useAgentsSection";

const AUTONOMY: { value: Autonomy; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "full-auto", label: "Full auto" },
];

const AUTONOMY_HINT: Record<Autonomy, string> = {
  auto: "Agents work freely inside their worktree and stop to ask before anything riskier.",
  "full-auto": "Agents never stop to ask for permission.",
};

export function AgentsSection({ project }: { project: Project }) {
  const a = useAgentsSection(project);

  return (
    <Section
      id="agents"
      title="Agents"
      description="Which agent new tasks start with, and how much it may do before stopping for you."
      aside={<SavedMark status={a.status} />}
    >
      <Row label="Autonomy" hint={AUTONOMY_HINT[a.autonomy]}>
        <Tabs value={a.autonomy} onChange={a.setAutonomy} items={AUTONOMY} />
      </Row>
      {a.autonomy === "full-auto" && (
        <div role="note" className="flex gap-3 bg-red/[0.04] px-4 py-3.5 text-[13px] text-ink-2">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-red" />
          <p className="[text-wrap:pretty]">
            Full auto lets an agent edit files and run any command, including network calls and
            deleting files, without asking. The worktree isolates your branches, not your machine.
            Use it on repositories you trust.
          </p>
        </div>
      )}
      <Row label="Default agent" hint="Preselected when you start a task in this project.">
        <div className="w-40">
          <Picker
            label="Default agent"
            value={a.kind}
            options={a.kindOptions}
            onChange={a.pickKind}
          />
        </div>
        <div className="w-44">
          <Picker
            label="Default model"
            value={a.model}
            options={a.modelOptions}
            onChange={a.pickModel}
          />
        </div>
      </Row>
    </Section>
  );
}
