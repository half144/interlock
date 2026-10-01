import type { Automation } from "@/types";
import { Button } from "@/components/ui/Button/Button";
import { Field } from "@/components/ui/Field/Field";
import { Input } from "@/components/ui/Input/Input";
import { Picker } from "@/components/ui/Picker/Picker";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { useAutomationDraft } from "@/features/automations/hooks/useAutomationDraft";
import { toAutomation } from "@/features/automations/utils/draft";
import { TemplateChips } from "./TemplateChips/TemplateChips";
import { TriggerField } from "./TriggerField/TriggerField";

export function NewAutomation({
  onCreate,
  onCancel,
}: {
  onCreate: (a: Automation) => void;
  onCancel: () => void;
}) {
  const { draft: d, set, startFrom, ready, projects, kinds, models } = useAutomationDraft();

  return (
    <section aria-label="New automation" className="rounded-lg border border-seam-2 bg-hover p-5">
      <TemplateChips onPick={startFrom} />

      <div className="mt-5 grid grid-cols-2 gap-4">
        <Field label="Name">
          <Input
            value={d.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="Nightly flaky-test sweep"
          />
        </Field>
        <Field label="Project">
          <Picker
            label="Project"
            value={d.projectId}
            options={projects.map((p) => ({
              value: p.id,
              label: p.name,
              hint: p.remoteUrl ?? p.rootPath,
            }))}
            onChange={(projectId) => set({ projectId })}
          />
        </Field>

        <TriggerField draft={d} set={set} />

        <Field label="Prompt" className="col-span-2">
          <Textarea
            rows={3}
            value={d.prompt}
            onChange={(e) => set({ prompt: e.target.value })}
            placeholder="What the agent should do every time this fires"
            className="resize-none leading-[1.55]"
          />
        </Field>

        <Field label="Agent">
          <Picker
            label="Agent"
            value={d.kind}
            options={kinds}
            onChange={(kind) => set({ kind, model: "" })}
          />
        </Field>
        <Field label="Model">
          <Picker
            label="Model"
            value={d.model}
            options={models}
            onChange={(model) => set({ model })}
          />
        </Field>
      </div>

      <footer className="mt-5 flex items-center gap-2 border-t border-seam pt-4">
        <span className="text-[12.5px] text-ink-3">
          Each run gets a fresh worktree from main and its own agent ID.
        </span>
        <Button variant="ghost" className="ml-auto" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" disabled={!ready} onClick={() => onCreate(toAutomation(d))}>
          Create automation
        </Button>
      </footer>
    </section>
  );
}
