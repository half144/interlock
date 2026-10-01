import type { PanelTab, View } from "@/types";

export interface Route {
  view: View;
  /** The open side panel's tab; null while it is closed. */
  panel: PanelTab | null;
}

const SLUG_OF: Partial<Record<PanelTab, string>> = {
  diff: "code",
  terminal: "terminal",
  checks: "checks",
  agents: "agents",
};

const TAB_OF = Object.fromEntries(
  Object.entries(SLUG_OF).map(([tab, slug]) => [slug, tab as PanelTab]),
);

export function pathOf({ view, panel }: Route): string {
  switch (view.kind) {
    case "yard":
      return "/";
    case "automations":
      return "/automations";
    case "accounts":
      return "/settings/accounts";
    case "settings":
      return `/project/${encodeURIComponent(view.projectId)}/settings`;
    case "thread": {
      const slug = panel && SLUG_OF[panel];
      return `/thread/${encodeURIComponent(view.threadId)}${slug ? `/${slug}` : ""}`;
    }
  }
}

const closed = (view: View): Route => ({ view, panel: null });

export function routeOf(pathname: string): Route {
  const [first, id, second] = pathname.split("/").filter(Boolean).map(decodeURIComponent);
  if (first === "thread" && id) {
    return {
      view: { kind: "thread", threadId: id },
      panel: (second ? TAB_OF[second] : undefined) ?? null,
    };
  }
  if (first === "project" && id && second === "settings") {
    return closed({ kind: "settings", projectId: id });
  }
  if (first === "settings" && id === "accounts") return closed({ kind: "accounts" });
  if (first === "automations") return closed({ kind: "automations" });
  return closed({ kind: "yard" });
}

/** Two routes are the same screen when only the panel differs: moving between them replaces the history entry. */
export const sameScreen = (a: Route, b: Route) =>
  pathOf({ ...a, panel: null }) === pathOf({ ...b, panel: null });
