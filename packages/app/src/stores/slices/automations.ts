import type { Automation } from "@/types";
import type { SliceCreator } from "../types";

export interface AutomationSlice {
  /** Newest first. Automations are out of v1; the list stays empty and the view is hidden. */
  automations: Automation[];

  addAutomation: (automation: Automation) => void;
  toggleAutomation: (id: string) => void;
}

export const createAutomationSlice: SliceCreator<AutomationSlice> = (set) => ({
  automations: [],

  addAutomation: (automation) => set((s) => ({ automations: [automation, ...s.automations] })),
  toggleAutomation: (id) =>
    set((s) => ({
      automations: s.automations.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    })),
});
