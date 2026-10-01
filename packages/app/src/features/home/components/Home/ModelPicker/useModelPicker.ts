import { useStore } from "@/stores/app-store";
import { modelLabel } from "@/lib/providers";
import type { ModelChoice } from "@/features/home/types";

export function useModelPicker() {
  const providers = useStore((s) => s.providers);
  return {
    providers,
    labelOf: (choice: ModelChoice) => modelLabel(providers, choice.kind, choice.model),
  };
}
