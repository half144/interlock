import { automations as seedAutomations } from "@/mocks/automations";
import type { Automation } from "@/types";
import type { SliceCreator } from "../types";

export interface AutomationSlice {
  /** Newest first: ones made in this session sit above the seeded ones. */
  automations: Automation[];

  addAutomation: (automation: Automation) => void;
  toggleAutomation: (id: string) => void;
}

export const createAutomationSlice: SliceCreator<AutomationSlice> = (set) => ({
  automations: seedAutomations,

  addAutomation: (automation) => set((s) => ({ automations: [automation, ...s.automations] })),
  toggleAutomation: (id) =>
    set((s) => ({
      automations: s.automations.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    })),
});
