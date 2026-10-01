import { useState } from "react";
import { useStore } from "@/stores/app-store";
import { useProjectList } from "@/stores/selectors";
import { modelsOf, providerOptions } from "@/lib/providers";
import { BLANK_DRAFT, type Draft } from "@/features/automations/utils/draft";

/** The new-automation form's state: patch any field, or start over from a template. */
export function useAutomationDraft() {
  const [draft, setDraft] = useState<Draft>(BLANK_DRAFT);
  const providers = useStore((s) => s.providers);
  const projects = useProjectList();
  const set = (patch: Partial<Draft>) => setDraft((prev) => ({ ...prev, ...patch }));
  const startFrom = (template: Partial<Draft>) => setDraft({ ...BLANK_DRAFT, ...template });
  const ready = Boolean(draft.name.trim() && draft.prompt.trim());
  return {
    draft: { ...draft, projectId: draft.projectId || (projects[0]?.id ?? "") },
    set,
    startFrom,
    ready,
    projects,
    kinds: providerOptions(providers),
    models: modelsOf(providers, draft.kind).map((m) => ({ value: m.id, label: m.label })),
  };
}
