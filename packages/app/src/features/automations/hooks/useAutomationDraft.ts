import { useState } from "react";
import { BLANK_DRAFT, type Draft } from "@/features/automations/utils/draft";

/** The new-automation form's state: patch any field, or start over from a template. */
export function useAutomationDraft() {
  const [draft, setDraft] = useState<Draft>(BLANK_DRAFT);
  const set = (patch: Partial<Draft>) => setDraft((prev) => ({ ...prev, ...patch }));
  const startFrom = (template: Partial<Draft>) => setDraft({ ...BLANK_DRAFT, ...template });
  const ready = Boolean(draft.name.trim() && draft.prompt.trim());
  return { draft, set, startFrom, ready };
}
