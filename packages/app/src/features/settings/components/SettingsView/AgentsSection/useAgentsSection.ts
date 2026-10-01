import { useStore } from "@/stores/app-store";
import { defaultModelId, modelsOf, providerOptions } from "@/lib/providers";
import type { AgentKind, Autonomy, Project } from "@/types";
import { useSaveSettings } from "@/features/settings/hooks/useSaveSettings";

export function useAgentsSection(project: Project) {
  const providers = useStore((s) => s.providers);
  const { status, save } = useSaveSettings(project.id);
  const kind = project.settings.defaultKind ?? providers[0]?.kind ?? "claude";
  const model = project.settings.defaultModel ?? defaultModelId(providers, kind) ?? "";

  return {
    status,
    autonomy: project.settings.autonomy,
    kind,
    model,
    kindOptions: providerOptions(providers),
    modelOptions: modelsOf(providers, kind).map((m) => ({ value: m.id, label: m.label })),
    setAutonomy: (autonomy: Autonomy) => void save({ autonomy }),
    pickKind: (next: AgentKind) =>
      void save({ defaultKind: next, defaultModel: defaultModelId(providers, next) }),
    pickModel: (next: string) => void save({ defaultKind: kind, defaultModel: next }),
  };
}
