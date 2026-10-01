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

### W2 (revised after W1.5) — data layer + engine features in parallel

| Group                           | Owns                                                                                     | Goal                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| G6 App data layer               | `packages/app/src/{daemon,stores,types,lib,app,mocks}` + wiring `src/platform` in `app/` | Connection (Tauri `getDaemonConnection`, browser env fallback), typed client, adapters protocol → store types, store fed by the daemon, simulation and mock data out of runtime paths, routes (one URL per screen), spec §7 type changes. Existing screens keep rendering from the new store shapes                                                                                                          |
| G8s Engine: projects & accounts | `packages/{server,protocol,client}`, additive modules, minimal edits to shared files     | Project settings persisted (setup script, env, files to copy + `.worktreeinclude`, autonomy mode, default provider/model, archive-after-merge) and used by worktree bootstrap instead of `paseo.json`; git-only add-project validation; first-run diagnostics RPC (git/claude/codex/gh installed, logged in, plan); in-app login for Codex (`account/login/start`) and Claude (`claude auth login`) + logout |
| G10s Engine: review & ship      | `packages/{server,protocol,client}`, additive modules, minimal edits to shared files     | Create PR via `gh` (push, title and body from the agent), PR status + `gh pr checks` polling, archive on merge honoring the project setting, Discard (stop agent, remove worktree, delete local branch), auto-naming wired at task start                                                                                                                                                                     |

G8s and G10s both touch `session.ts` / `messages.ts`: re-read right before each edit, keep edits small, put logic in new modules.

### W3 (revised) — app features in parallel on top of G6

G8a (settings, first-run, login screens), G9 (home + thread), G10a (workspace), G11 (shell, subagents, palette, usage). App side only; server changes only for a gap (small, additive, reported).

### Resource limits (the user's Mac has 16 GB)

- At most **2** build agents run at the same time.
- Lint only the files you changed: `NODE_OPTIONS=--max-old-space-size=3072 npx eslint <files>`. Never run `node scripts/quality/lint.mjs`, root `npm run lint` or `npm run check` (the orchestrator runs those alone).
- Typecheck and test only your own workspace. One daemon and one vite at a time, stopped right after verifying. Close your agent-browser session after screenshots.
- One heavy command at a time (no parallel tsc / eslint / vitest / cargo).
