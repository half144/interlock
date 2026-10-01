import type { ProviderUsage } from "@/types";
import type { SliceCreator } from "../types";

export interface UsageSlice {
  usage: ProviderUsage[];
  setUsage: (usage: ProviderUsage[]) => void;
}

export const createUsageSlice: SliceCreator<UsageSlice> = (set) => ({
  usage: [],
  setUsage: (usage) => set({ usage }),
});
