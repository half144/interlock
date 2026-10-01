import { Bot, Layers, MessageSquare, Plus, Settings } from "lucide-react";
import { useStore } from "@/stores/app-store";
import { byRecentActivity } from "@/lib/threads";
import type { Project, SubagentStatus, Thread } from "@/types";
import type { PaletteItem } from "@/features/palette/types";
import { selectPaletteItems } from "@/features/palette/utils/selectItems";

const SUB_ORDER: Record<SubagentStatus, number> = {
  running: 0,
  queued: 1,
  failed: 2,
  stopped: 3,
  done: 4,
};

const s = useStore.getState;

const commandsFor = (projects: Project[]): PaletteItem[] => [
  {
    id: "cmd-new",
    group: "Commands",
    title: "New task",
    icon: Plus,
    keys: ["D"],
    run: () => s().newTask(),
  },
  {
    id: "cmd-agents",
    group: "Commands",
    title: "Go home",
    icon: Layers,
    keys: ["G", "H"],
    run: () => s().go({ kind: "yard" }),
  },
  ...projects.map<PaletteItem>((p) => ({
    id: `cmd-settings-${p.id}`,
    group: "Commands",
    title: `${p.name} settings`,
    icon: Settings,
    run: () => s().go({ kind: "settings", projectId: p.id }),
  })),
];

/** Everything the palette can reach, filtered by a case-insensitive substring query. */
export function usePaletteItems(rawQuery: string): PaletteItem[] {
  const agents = useStore((s) => s.agents);
  const threads = useStore((s) => s.threads);
  const subagents = useStore((s) => s.subagents);
  const projects = useStore((s) => s.projects);
  const agentOf = (t: Thread) => {
    const id = t.agentIds[0];
    return id ? agents[id] : undefined;
  };

  const needsYou: PaletteItem[] = Object.values(agents)
    .filter((a) => a.aspect === "held" || a.aspect === "failed")
    .map((a) => ({
      id: `needs-${a.id}`,
      group: "Needs you",
      title: a.hold?.title ?? a.title,
      hint: projects[a.projectId]?.name ?? "",
      agent: a,
      run: () => s().openThread(a.threadId),
    }));

  const threadItems: PaletteItem[] = Object.values(threads)
    .sort(byRecentActivity)
    .map((t) => ({
      id: `thread-${t.id}`,
      group: "Threads",
      title: t.title,
      hint: projects[t.projectId]?.name ?? "",
      icon: MessageSquare,
      agent: agentOf(t),
      run: () => s().openThread(t.id),
    }));

  const subagentItems: PaletteItem[] = Object.values(subagents)
    .sort((a, b) => SUB_ORDER[a.status] - SUB_ORDER[b.status])
    .flatMap((sub) => {
      const parent = agents[sub.parentId];
      if (!parent) return [];
      return {
        id: `sub-${sub.id}`,
        group: "Subagents",
        title: `${sub.name}: ${sub.brief}`,
        hint: parent.headcode,
        icon: Bot,
        run: () => {
          s().openThread(parent.threadId);
          s().openSubagent(sub.id);
        },
      };
    });

  return selectPaletteItems(
    [...needsYou, ...threadItems, ...subagentItems, ...commandsFor(Object.values(projects))],
    rawQuery,
  );
}
