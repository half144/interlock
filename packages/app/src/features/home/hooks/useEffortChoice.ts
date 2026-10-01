import { useState } from "react";
import { useStore } from "@/stores/app-store";
import { effortsOf } from "@/lib/providers";
import type { ModelChoice } from "@/features/home/types";

/** The reasoning levels the chosen model offers, and the one the task starts with: the model's default until you pick another. */
export function useEffortChoice(choice: ModelChoice) {
  const providers = useStore((s) => s.providers);
  const [picked, setEffort] = useState<string | null>(null);
  const efforts = effortsOf(providers, choice.kind, choice.model);
  const current =
    efforts.find((e) => e.id === picked) ?? efforts.find((e) => e.isDefault) ?? efforts[0];
  return { efforts, effort: current?.id ?? "", setEffort };
}
