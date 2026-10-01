# Build plan (v1)

How the v1 in `docs/spec-v1.md` is built. Work runs in **waves**. Inside a wave, **groups** run in parallel, each owning a disjoint set of files. The orchestrator (main thread) integrates and verifies between waves.

## Ground rules for every group

- **Read first:** `CLAUDE.md` and `docs/spec-v1.md`, in full.
- **Paseo** (`~/Documents/personal/paseo`, commit `d7c7044`) is the reference: before solving anything non-trivial, look at how it does it.
- **Ownership:**
  - Edit only the files your group owns. Need something outside them? Ask through your final report, unless the plan says otherwise.
  - Shared files (root `package.json`, `tsconfig.base.json`) belong to G4 in W1 and to the orchestrator after that.
- **Toolchain:**
  - Rust lives at `~/.cargo/bin`, which isn't on PATH by default; export `PATH="$HOME/.cargo/bin:$PATH"` in commands.
  - Node is 22.13 and npm 10. Install workspace deps from the repo root (`npm install`).
- **Done for a group means:**
  - its typecheck, build and tests pass;
  - it touched nothing outside its ownership;
  - it records divergences in `docs/upstream-sync.md` (forked code) or as an ADR in `docs/decisions/`;
  - it ends with a short report: files changed, what works, what's left, anything needed from other groups.
- **Never:**
  - commit (the orchestrator commits after integrating);
  - push, or create remote repos;
  - modify the user's global config (`~/.claude`, `~/.codex`, shell profiles);
  - run real Claude/Codex agents (only the orchestrator does, in validation).
- **Product questions:** decide from the spec, note the decision in your report, and continue.

## Waves

### W1 — Foundation (M0)

| Group          | Owns                                                                                                                                                                                                                                                | Goal                                                                                                                                                                                                                                                               |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| G1 Engine fork | `packages/protocol`, `packages/client`, `packages/server` (+ any Paseo package they need, e.g. `packages/highlight`)                                                                                                                                | Paseo's daemon copied in, renamed `@interlock/*`, home `~/.interlock`, its own default port, and it builds, tests and runs headless (`npm run dev:daemon -w @interlock/server`)                                                                                    |
| G2 App move    | `packages/app`                                                                                                                                                                                                                                      | The prototype UI (`~/Documents/personal/testing-ui`) as a workspace package, restructured to one folder per component (codemod with import rewrite), same behaviour and still on mocks; typecheck and build pass                                                   |
| G3 Desktop     | `apps/desktop`                                                                                                                                                                                                                                      | Tauri v2 shell: window (dev URL / built app), menu bar icon, dialog, notification and shell plugins, login-shell PATH, daemon sidecar spawned with a per-launch token, connection info exposed to the webview, no (no voice in v1). `cargo fmt`/`clippy` are clean |
| G4 Tooling     | root configs: `package.json` scripts and devDeps, `tsconfig.base.json`, `eslint.config.js`, `knip.json`, `.jscpd.json`, `.oxfmtrc.json`, `lefthook.yml`, `commitlint`, `.github/workflows/ci.yml`, `scripts/quality/*`, `.editorconfig`, `.vscode/` | The strict environment from spec §8: strictest TypeScript, ESLint type-aware, project rules (structure, view/hook, slots), a frozen baseline for inherited code, and `npm run check`                                                                               |

### W2 — Core wiring (M0 end, M1 core)

| Group             | Owns                                                                 | Goal                                                                                                                                                                                                                               |
| ----------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G5 Engine trim    | `packages/server`, `packages/protocol`, `packages/client`            | Cut what spec §3 says (relay, hub, mobile, voice mode, plugins, schedules, labels, browser, providers other than claude/codex/mock), keeping uploads, quota (claude/codex), github, worktrees, terminal and diff. Tests stay green |
| G6 App data layer | `packages/app/src/{daemon,stores,types,lib}`, `packages/app/src/app` | `daemon/` connection and typed client, adapters (timeline → blocks, todo → steps, provider subagents, usage, diff), store fed by the daemon, simulation removed, routes (one URL per screen), types per spec §7                    |
| G7 Desktop bridge | `apps/desktop`, `packages/app/src/platform/`                         | Folder picker, notifications, dock and menu bar badge, menu bar behaviour on close (⌘Q confirm), open a task from a notification. The app-side bridge lives in `src/platform/`                                                     |

### W3 — Features (M1 rest, M2, M3)

Each group converts every component it touches to the view/hook pattern and cleans its comments.

| Group                   | Owns (app)                                                                      | Owns (server: additive modules preferred) | Goal                                                                                                                                                                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G8 Projects & accounts  | `features/settings`, first-run/login screens                                    | project config, provider login            | Add project, project settings persisted (setup, env, files, autonomy, default model), first-run checks, login to Claude and Codex in-app, Accounts                                                                                    |
| G9 Tasks & conversation | `features/home`, `features/thread`                                              | worktree creation inputs, naming          | New task (worktree + provider + model + effort + mode + base branch), attachments, live conversation (text, reasoning, tools, plan, permissions, questions, plan approval), follow-up/steer, stop, discard, AI naming, Waiting on you |
| G10 Workspace           | `features/workspace`                                                            | checkout diff, terminal, github           | Code tab and mini-IDE on the real diff, batched review comments, terminal (setup + shell, xterm.js), Checks + Create PR via gh, archive on merge                                                                                      |
| G11 Shell & subagents   | `features/shell`, `features/subagents`, `features/palette`, `components/layout` | —                                         | Sidebar and ⌘K on real data, out-of-scope UI hidden, usage pill (rings + popover), subagents the Claude Code way                                                                                                                      |

### W4 — Validation (orchestrator)

- `npm run check` green.
- The `.app` builds; the app runs.
- Real smoke tests with Claude and Codex on a temp repo.
- Screenshots of every screen; fixes dispatched to groups as needed.
- A final report with the list of decisions taken.

### W1.5 — Make W1 green (inserted after W1 integration)

| Group                                | Owns                                                                                                                 | Goal                                                                                                                                                                                                |
| ------------------------------------ | -------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| G5 Engine trim (moved up from W2)    | `packages/server`, `packages/protocol`, `packages/client`, `packages/relay`, `packages/plugin`, `packages/highlight` | W2 G5 goal, plus: a `packages/server/tsconfig.json` the ESLint project service can use; unused `eslint-disable` directives removed; knip clean for the engine; all voice and dictation code removed |
| G2b App strict                       | `packages/app` except `src/platform/`                                                                                | `tsconfig` extends `../../tsconfig.base.json` (strictest) and every resulting error is fixed; the structure check is clean (`lib/customerStyle.ts` must not import react); behaviour unchanged      |
| G7 Desktop bridge (moved up from W2) | `apps/desktop`, `packages/app/src/platform/`                                                                         | W2 G7 goal                                                                                                                                                                                          |
