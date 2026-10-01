import { Layers, MessageSquare, Plus, Settings, Workflow } from "lucide-react";
import { projectOf, projects } from "@/mocks/projects";
import { useStore } from "@/stores/app-store";
import { byRecentActivity } from "@/lib/threads";
import type { SubagentStatus, Thread } from "@/types";
import { roleIcon } from "@/lib/roleIcon";
import type { PaletteGroup, PaletteItem } from "@/features/palette/types";

const GROUP_ORDER: PaletteGroup[] = ["Needs you", "Threads", "Subagents", "Commands"];
const LIMIT: Record<PaletteGroup, number> = {
  "Needs you": 4,
  Threads: 6,
  Subagents: 3,
  Commands: 5,
};
const SUB_ORDER: Record<SubagentStatus, number> = {
  running: 0,
  queued: 1,
  failed: 2,
  stopped: 3,
  done: 4,
};

const matches = (query: string, ...fields: (string | undefined)[]) =>
  !query || fields.some((f) => f?.toLowerCase().includes(query));

const s = useStore.getState;

const commands: PaletteItem[] = [
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
  {
    id: "cmd-auto",
    group: "Commands",
    title: "Go to automations",
    icon: Workflow,
    keys: ["G", "A"],
    run: () => s().go({ kind: "automations" }),
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
  const query = rawQuery.trim().toLowerCase();
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
      hint: projectOf(a.projectId).name,
      agent: a,
      run: () => s().openThread(a.threadId),
    }));

  const threadItems: PaletteItem[] = Object.values(threads)
    .sort(byRecentActivity)
    .map((t) => ({
      id: `thread-${t.id}`,
      group: "Threads",
      title: t.title,
      hint: projectOf(t.projectId).name,
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
        icon: roleIcon[sub.role],
        run: () => {
          s().openThread(parent.threadId);
          s().openSubagent(sub.id);
        },
      };
    });

  const searchable = (item: PaletteItem) => [
    item.title,
    item.hint,
    item.agent?.headcode,
    item.agent?.branch,
  ];
  const all = [...needsYou, ...threadItems, ...subagentItems, ...commands].filter((item) =>
    matches(query, ...searchable(item)),
  );

  return GROUP_ORDER.flatMap((group) =>
    all.filter((i) => i.group === group).slice(0, query ? 8 : LIMIT[group]),
  );
}
