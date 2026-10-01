import { defaultModelId, modelsOf } from "@/lib/providers";
import type { ProjectSettings, ProviderEntry } from "@/types";
import type { ModelChoice } from "@/features/home/types";

/** The agent and model a project starts tasks with: its saved defaults where the catalog still has them, else the first provider's default. */
export function defaultChoice(
  providers: ProviderEntry[],
  settings: Pick<ProjectSettings, "defaultKind" | "defaultModel"> | undefined,
): ModelChoice {
  const kind =
    providers.find((p) => p.kind === settings?.defaultKind)?.kind ?? providers[0]?.kind ?? "claude";
  const saved = settings?.defaultModel;
  const model =
    saved && modelsOf(providers, kind).some((m) => m.id === saved)
      ? saved
      : (defaultModelId(providers, kind) ?? "");
  return { kind, model };
}
