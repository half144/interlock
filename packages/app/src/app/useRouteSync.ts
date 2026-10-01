import { useEffect } from "react";
import { useStore } from "@/stores/app-store";
import type { AppState } from "@/stores/types";
import { pathOf, routeOf, sameScreen, type Route } from "./routes";

const routeOfState = (s: AppState): Route => ({
  view: s.view,
  panel: s.panelOpen ? s.panelTab : null,
});

function show(route: Route) {
  const s = useStore.getState();
  if (route.view.kind === "thread") s.openThread(route.view.threadId);
  else s.go(route.view);
  if (route.panel) s.openPanel(route.panel);
  else s.setPanelOpen(false);
}

/** The URL and the store describe the same screen: navigating either one updates the other. */
export function useRouteSync() {
  useEffect(() => {
    let current = routeOf(location.pathname);
    show(current);

    const unsubscribe = useStore.subscribe((state) => {
      const next = routeOfState(state);
      if (pathOf(next) === pathOf(current) || pathOf(next) === location.pathname) return;
      const replace = sameScreen(current, next);
      current = next;
      if (replace) history.replaceState(null, "", pathOf(next));
      else history.pushState(null, "", pathOf(next));
    });

    const onPop = () => {
      current = routeOf(location.pathname);
      show(current);
    };
    window.addEventListener("popstate", onPop);
    return () => {
      unsubscribe();
      window.removeEventListener("popstate", onPop);
    };
  }, []);
}
