# 0010 — App routes without a router library

- **Context:** spec section 7 asks for one URL per screen (`/`, `/thread/:id`, `/project/:id/settings`) so the quality-kit can open every screen and a macOS notification can open a task. The store already owns navigation (`view`, `panelOpen`, `panelTab`) and 52 files read it.
- **Decision:** no `react-router`. `app/routes.ts` holds two pure functions, `pathOf(route)` and `routeOf(pathname)`, and `useRouteSync` keeps the store and `history` in step: store changes push a history entry (a panel-only change replaces it) and `popstate` and the first load apply the URL to the store. The panel tab is part of the URL (`/thread/:id/code`, `/terminal`, `/checks`, `/agents`); the hidden Preview tab is not.
- **Why:**
  - The app has four screens and no nested layouts, loaders or params beyond one id, so a router would duplicate state the store already holds and force every `go()`/`openThread()` caller through it.
  - The mapping is pure, unit-tested, and swapping in a library later only touches `useRouteSync`.
- **Consequences:** the thread id is the agent id. A deep link to an agent the daemon has not synced yet shows an empty thread until the first sync finishes.
