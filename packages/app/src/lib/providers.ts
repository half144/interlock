import type { AgentKind, EffortOption, ModelOption, ProviderEntry } from "@/types";
import type { PickerOption } from "./options";

export const modelsOf = (providers: ProviderEntry[], kind: AgentKind): ModelOption[] =>
  providers.find((p) => p.kind === kind)?.models ?? [];

/** The model a new task starts on: the one the provider marks as default, else the first it lists. */
export const defaultModelId = (providers: ProviderEntry[], kind: AgentKind): string | null => {
  const models = modelsOf(providers, kind);
  return (models.find((m) => m.isDefault) ?? models[0])?.id ?? null;
};

export const modelLabel = (providers: ProviderEntry[], kind: AgentKind, modelId: string | null) =>
  modelsOf(providers, kind).find((m) => m.id === modelId)?.label ?? modelId ?? "Default model";

export const effortsOf = (
  providers: ProviderEntry[],
  kind: AgentKind,
  modelId: string | null,
): EffortOption[] => modelsOf(providers, kind).find((m) => m.id === modelId)?.efforts ?? [];

export const providerOptions = (providers: ProviderEntry[]): PickerOption<AgentKind>[] =>
  providers.map((p) => ({ value: p.kind, label: p.label }));
