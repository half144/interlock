import type { PaletteGroup, PaletteItem } from "@/features/palette/types";

const GROUP_ORDER: PaletteGroup[] = ["Needs you", "Threads", "Subagents", "Commands"];

const LIMIT: Record<PaletteGroup, number> = {
  "Needs you": 4,
  Threads: 6,
  Subagents: 3,
  Commands: 5,
};
const LIMIT_WHEN_SEARCHING = 8;

const matches = (query: string, item: PaletteItem) =>
  [item.title, item.hint, item.agent?.headcode, item.agent?.branch].some((field) =>
    field?.toLowerCase().includes(query),
  );

/** Filters by a case-insensitive substring and lists the groups in order, each capped. */
export function selectPaletteItems(all: PaletteItem[], rawQuery: string): PaletteItem[] {
  const query = rawQuery.trim().toLowerCase();
  const found = query ? all.filter((item) => matches(query, item)) : all;
  return GROUP_ORDER.flatMap((group) =>
    found.filter((i) => i.group === group).slice(0, query ? LIMIT_WHEN_SEARCHING : LIMIT[group]),
  );
}
