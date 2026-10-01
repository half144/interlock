import type { LucideIcon } from "lucide-react";
import type { Agent } from "@/types";

export type PaletteGroup = "Needs you" | "Threads" | "Subagents" | "Commands";

/** One result in the command palette: a thread, subagent or command, and what running it does. */
export interface PaletteItem {
  id: string;
  group: PaletteGroup;
  title: string;
  hint?: string;
  icon?: LucideIcon;
  agent?: Agent | undefined;
  keys?: string[];
  run: () => void;
}
