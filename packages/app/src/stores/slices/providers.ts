import type { ProviderEntry } from "@/types";
import type { SliceCreator } from "../types";

export interface ProviderSlice {
  /** The providers the daemon offers, with the real models and efforts of each. */
  providers: ProviderEntry[];
  setProviders: (providers: ProviderEntry[]) => void;
}

export const createProviderSlice: SliceCreator<ProviderSlice> = (set) => ({
  providers: [],
  setProviders: (providers) => set({ providers }),
});
