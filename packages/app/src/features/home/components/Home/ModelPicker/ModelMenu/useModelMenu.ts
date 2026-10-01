import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { AgentKind, ProviderEntry } from "@/types";
import type { ModelChoice } from "@/features/home/types";
import {
  groupModels,
  moveActive,
  selectionIn,
  type ModelEntry,
} from "@/features/home/utils/modelGroups";

export const EARLIER = "earlier";

const holds = (entry: ModelEntry, modelId: string) =>
  entry.id === modelId || entry.wideId === modelId;

export function useModelMenu(
  providers: ProviderEntry[],
  value: ModelChoice,
  onPick: (choice: ModelChoice) => void,
  onClose: () => void,
) {
  const [kind, setKind] = useState<AgentKind>(value.kind);
  const groups = useMemo(
    () => groupModels(providers.find((p) => p.kind === kind)?.models ?? []),
    [providers, kind],
  );
  const selectedHere = kind === value.kind;
  const [earlierOpen, setEarlierOpen] = useState(
    () => selectedHere && groups.earlier.some((e) => holds(e, value.model)),
  );
  const [active, setActive] = useState(
    () => [...groups.current, ...groups.earlier].find((e) => holds(e, value.model))?.id ?? "",
  );
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => root.current?.focus(), []);
  useEffect(() => {
    root.current
      ?.querySelector(`[data-nav="${CSS.escape(active)}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const nav = [
    ...groups.current.map((e) => e.id),
    ...(groups.earlier.length > 0 ? [EARLIER] : []),
    ...(earlierOpen ? groups.earlier.map((e) => e.id) : []),
  ];
  const entryOf = (id: string) => [...groups.current, ...groups.earlier].find((e) => e.id === id);

  const pick = (modelId: string) => onPick({ kind, model: modelId });
  const toggleEarlier = () => setEarlierOpen((o) => !o);
  const switchTo = (next: AgentKind) => {
    if (next === kind) return;
    const first = groupModels(providers.find((p) => p.kind === next)?.models ?? []).current[0];
    setKind(next);
    setEarlierOpen(false);
    setActive(first?.id ?? "");
  };

  const step = (by: number) => {
    const next = providers[providers.findIndex((p) => p.kind === kind) + by];
    if (next) switchTo(next.kind);
  };
  const confirm = () => (active === EARLIER ? toggleEarlier() : pick(active));
  const pickWide = () => {
    const wideId = entryOf(active)?.wideId;
    if (wideId) pick(wideId);
  };
  const actions: Record<string, () => void> = {
    ArrowRight: () => step(1),
    ArrowLeft: () => step(-1),
    Enter: confirm,
    " ": confirm,
    m: pickWide,
    M: pickWide,
    Escape: onClose,
    Tab: onClose,
  };

  const onKey = (e: KeyboardEvent) => {
    const moved = moveActive(e.key, nav, active);
    if (moved !== null) setActive(moved);
    else if (actions[e.key]) actions[e.key]?.();
    else return;
    e.preventDefault();
  };

  return {
    kind,
    groups,
    earlierOpen,
    active,
    root,
    setActive,
    switchTo,
    toggleEarlier,
    pick,
    onKey,
    selectionIn: (entry: ModelEntry) => (selectedHere ? selectionIn(entry, value.model) : null),
  };
}
