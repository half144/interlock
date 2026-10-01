import type { ModelOption } from "@/types";

export interface ModelEntry {
  id: string;
  label: string;
  /** The 1M-context twin of this model, when the catalog lists one. */
  wideId: string | null;
}

export interface ModelGroups {
  current: ModelEntry[];
  earlier: ModelEntry[];
}

const WIDE_SUFFIX = /\s+1M$/;
const VERSION = /\d+(?:\.\d+)*/;

const versionOf = (label: string) => VERSION.exec(label)?.[0].split(".").map(Number) ?? null;

const familyOf = (label: string) =>
  label
    .replace(VERSION, " ")
    .replace(/[\s-]+/g, " ")
    .trim();

const compareVersions = (a: number[], b: number[]) => {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const diff = (a[i] ?? 0) - (b[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
};

/** One entry per model, with "X 1M" folded into "X" when both are listed. */
function mergeWide(models: ModelOption[]): ModelEntry[] {
  const labels = new Set(models.map((m) => m.label));
  const wideOf = new Map<string, string>();
  for (const m of models) {
    const base = m.label.replace(WIDE_SUFFIX, "");
    if (base !== m.label && labels.has(base)) wideOf.set(base, m.id);
  }
  return models
    .filter((m) => !(WIDE_SUFFIX.test(m.label) && labels.has(m.label.replace(WIDE_SUFFIX, ""))))
    .map((m) => ({ id: m.id, label: m.label, wideId: wideOf.get(m.label) ?? null }));
}

/** The newest model of each family leads; everything older folds away. Catalog order is kept in both halves. */
export function groupModels(models: ModelOption[]): ModelGroups {
  const entries = mergeWide(models);
  const newest = new Map<string, ModelEntry>();
  for (const entry of entries) {
    const version = versionOf(entry.label);
    if (!version) continue;
    const family = familyOf(entry.label);
    const best = newest.get(family);
    const bestVersion = best && versionOf(best.label);
    if (!bestVersion || compareVersions(version, bestVersion) > 0) newest.set(family, entry);
  }
  const current: ModelEntry[] = [];
  const earlier: ModelEntry[] = [];
  for (const entry of entries) {
    const leads = !versionOf(entry.label) || newest.get(familyOf(entry.label)) === entry;
    (leads ? current : earlier).push(entry);
  }
  return { current, earlier };
}

export function selectionIn(entry: ModelEntry, modelId: string | null) {
  if (entry.id === modelId) return "base";
  return entry.wideId === modelId ? "wide" : null;
}

/** Where the arrow keys take the highlight, or null for any other key. */
export function moveActive(key: string, order: string[], active: string): string | null {
  const at = order.indexOf(active);
  const to = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: order.length - 1 }[key];
  return to === undefined ? null : (order[Math.min(order.length - 1, Math.max(0, to))] ?? null);
}
