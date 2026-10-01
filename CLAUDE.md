# Interlock

A macOS desktop app that orchestrates real **Claude Code** and **Codex** agents on the user's machine. Every task runs in its own git worktree. The app only interrupts the user when it needs them, and the work ships as a pull request.

- **UI:** the Interlock prototype (React).
- **Engine:** a fork of the Paseo daemon (Apache-2.0).

**The source of truth is [`docs/spec-v1.md`](docs/spec-v1.md).** Read it before starting any work. It holds the decisions, the scope, what is out of scope, the milestones and the engineering design. If this file and the spec disagree, the spec wins; fix this file.

## Map

```
apps/desktop/          Tauri shell (Rust): window, menu bar, notifications, folder picker,
                       microphone, sidecar supervision, login-shell PATH
packages/app/          the UI (React 19, Vite, Tailwind v4, zustand, motion)
packages/server/       the daemon (Paseo fork): Claude/Codex providers, worktrees, git/diff,
                       terminal, usage limits, dictation, uploads, persistence
packages/protocol/     zod schemas and types shared by UI and daemon
packages/client/       typed WebSocket client
docs/                  spec-v1.md, decisions/ (ADRs), upstream-sync.md
```

Dependency rules (enforced by quality-kit's architecture check):

- `app → client → protocol`, and `server → protocol`. The UI never imports the server, and the server never imports the UI.
- `protocol` depends only on `zod`.
- Inside `app`, a feature never imports another feature; whatever two features share goes to `components/`, `hooks/` or `lib/`.
- No import cycles.

## Commands

These scripts are created in M0. Quality is enforced by [quality-kit](https://github.com/half144/quality-kit) in team mode; its ruleset lives in `.quality/`.

| Command | What it does |
|---|---|
| `quality-kit gate` | The checks on what changed: types, ESLint, architecture, tests, dead code, duplication, debt, rule integrity |
| `quality-kit verify --changed` | Opens the affected screens (desktop and phone) and records the proof |
| `quality-kit evidence still <route>` | Screenshots for the PR |
| `npm run check` | The full gate plus build and the Rust checks (`cargo fmt`, `clippy`) |
| `npm run dev:desktop` | The Tauri app with the daemon sidecar |
| `npm run dev:app` | UI only in the browser, against a running daemon |
| `npm run test` / `npm run lint` / `npm run typecheck` / `npm run format` | The individual gates |

## How to work

0. **Build straight from the spec.** No per-task tiny plan or approval (`requirePlan: false`) and no `task`/`ship` flow: the spec is the plan. The gate still runs at the end of every turn, subagents included, and you can't finish while it fails.
   - All work goes on one branch (`v1`), in milestone order, as green commits.
   - One PR at the end, opened with `gh`, carrying the evidence and the list of decisions you took along the way.
1. **Stay in scope.** Build only what the spec marks as in scope for the current milestone (spec §4, §10). Never build what §5 lists as out of scope, even when the prototype or Paseo has it. Hide it instead.
2. **Look at Paseo first.** Before solving anything non-trivial, check how Paseo solves it in `~/Documents/personal/paseo`, and prefer its approach. Examples: spawning processes, PATH, worktree edge cases, Claude/Codex protocol quirks, terminals, diffs, login, usage limits, dictation.
   - Start with its `CLAUDE.md`, then `docs/architecture.md`, `docs/agent-lifecycle.md`, `docs/data-model.md`, `docs/timeline-sync.md` and `docs/providers.md`.
   - Then the code: `packages/server/src/server/agent/providers/{claude,codex}`, `packages/server/src/utils/worktree.ts`, `packages/server/src/services/quota-fetcher` and `packages/desktop/src`.
   - Diverging is fine; record why.
3. **Work in parallel.** Split independent items across subagents with disjoint files. The main thread integrates and runs the final verification.
4. **Decide technical questions, ask product ones.** Make technical calls yourself and record them as a short ADR in `docs/decisions/`. Anything the user sees or feels goes back to the user.
   - **Design comes before rules.** A new architecture decision or pattern is discussed with the user first: one question at a time, each with your recommendation. It's recorded in the spec or an ADR, and only then becomes a quality-kit rule.
5. **Done means verified:**
   - the quality-kit gate passes;
   - changed screens are proven with `quality-kit verify --changed` and have evidence;
   - the change runs inside the Tauri app;
   - `npm run check` is green.
6. **Keep the spec alive.** Tick the §10 checkboxes as items close, and update the spec when a decision changes.

## Hard rules

- Never skip hooks (`--no-verify`).
- Never weaken lint, TypeScript or formatter settings to make code pass.
- Ruleset changes are human-only. The lint config, tsconfig flags, hooks, CI or frozen debt can only change through `quality-kit rules accept` or `quality-kit baseline`, run by the user in a real terminal. Propose the change instead.
- Never disable a rule inline without a reason, e.g. `// eslint-disable-next-line no-shadow -- shadowing the SDK's own name`.
- The legacy baseline (inherited Paseo files that break the strict rules) can only shrink. A file you touch must leave the baseline.
- **Secrets:** never commit secrets, tokens or `.env` files. Never log credentials. Provider credentials are read-only to us: never refreshed, never copied.
- **The user's machine:** never modify the user's global configuration (`~/.claude/settings.json`, `~/.codex/config.toml`, shell profiles). The app uses the CLIs' own logins and settings as they are.
- The daemon listens only on `127.0.0.1`, behind a per-launch token known only to the app window.

## UI code (`packages/app`)

### One folder per component, logic out of the view

```
features/thread/components/
├─ Composer/
│  ├─ Composer.tsx          view: props + hook → JSX
│  ├─ useComposer.ts        logic: store, state, effects, derived data, actions
│  └─ AttachmentChip/       a piece only Composer uses
│     └─ AttachmentChip.tsx
└─ ThreadHeader/
   └─ ThreadHeader.tsx      props only → no hook
```

- **One folder per component, always**, named after the component. Nothing sits loose in `components/`, `components/ui/` included.
- Files repeat the component name (`Composer/Composer.tsx`); no `index.ts` barrels.
- **Three layers, one direction:** `X.tsx → useX.ts → utils/*.ts`.
  - The `.tsx` has no logic. No store, no daemon client, no `useEffect`/`useLayoutEffect`/`useReducer`. It may use props, `useId`, DOM refs, purely visual state (open/hover) and its paired hook.
  - `useX.ts` returns one view-model object, named from the screen's point of view (`open`, `retry`).
  - `utils/` is pure TypeScript with no React, and is unit-tested.
- **When to create the hook:** as soon as the component needs the store, an effect, more than one state, non-trivial derivation, or a handler doing more than one call. Don't create empty hooks.
- **Placement:**

| It is… | It goes in |
|---|---|
| A component used by one feature | `features/<feature>/components/X/` |
| A piece used by one component only | inside that component's folder |
| A component used by 2+ features | `components/<group>/X/` |
| A domain-free primitive (button, modal, field) | `components/ui/X/` |
| A hook reused within a feature | `features/<feature>/hooks/` |
| A hook used by 2+ features | `hooks/` |
| Pure logic of one feature / shared pure logic | `features/<feature>/utils/` / `lib/` |
| Protocol → store translation | `daemon/adapters/` (the only place that knows protocol shapes) |
| Global state / domain types | `stores/slices/` / `types/` |

- A paired hook (`useX`) is used only by `X`. When another component needs it, promote it to `hooks/` under a generic name.

### Composition

- **Compose with slots, don't configure with flags.** Parts come in as props that take elements (`header={<TaskHeader />}`, `actions={…}`, typed `ReactNode`), with `children` for the main content.
- **No dot components** (`Card.Header`). Each part is its own component, imported normally, and the parent only decides where each slot appears.
- **Variants:** one `variant` prop instead of `isCompact` + `isGhost` + `hasBorder`.
- **Boolean props:** more than 3 boolean props or more than 10 props is a smell, and a project rule in the gate flags it.
- **One responsibility per component.** If describing it needs "and", it's two components.
  - Screen orchestrators stay lean (~120–170 lines) and only assemble pieces.
  - One visual state is one component: pending, done and error get their own components, and a parent picks which one to show.
- **No prop drilling past 2 levels.** Whoever has the data builds the piece and passes it through a slot, or the subtree uses its own hook.
- **Props carry data in and events out** (`onOpen`). Never pass `setState` or the store down.
- **Lists are a list component plus an item component;** the item receives only what it needs.
- **Reuse before you create:** use `components/ui` and the recipes in `styles.ts` first.

### State and data

- The daemon is the source of truth, and the store is a replica fed by daemon pushes. Actions are typed requests through the client.
- Optimistic updates are allowed only for trivial actions.
- **zustand:** select stable slices and derive in render. Never return new objects or arrays from a selector.
- Batch streaming deltas per frame before they reach the store.

### Visual design

`DESIGN.md` defines the visual language. Use its tokens and components:

- no new colors, radii or shadows outside the tokens;
- motion uses the tokens in `lib/motion.ts`;
- no AI-slop effects (glows, gradients, equalizers).

## Daemon code (`packages/server`, `packages/protocol`, `packages/client`)

- **Inherited files:** follow Paseo's style and patterns in inherited code.
  - Keep edits to inherited files minimal; prefer adding new modules next to them.
  - Record every divergence from upstream in `docs/upstream-sync.md`. The `upstream` remote points at Paseo.
- **Providers** implement `AgentClient` / `AgentSession`. Nothing outside a provider knows whether Claude or Codex is running.
- **Validation:** validate with zod at trust boundaries (WebSocket messages, files on disk, CLI output), not between internal functions.
- **Errors:**
  - Errors are typed, with a code (`rpc_error`). Never swallow one.
  - Messages say what happened and what to do.
  - Logs go to `~/.interlock/daemon.log`, never with tokens.
- **Persistence:** JSON files with atomic writes and a `version` field. Conversations are rebuilt from the provider's own history.
- **Cutting the fork:** cut what v1 doesn't use (spec §3, "What to cut from the fork"). Dead code goes (knip).

## Code quality

- **TypeScript is strict to the maximum:** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `verbatimModuleSyntax`.
  - No `any`, no non-null `!`, and type-only imports use `import type`.
- **Async:** no floating or misused promises. Every promise is awaited, returned or explicitly handled.
- **Lint is ESLint** (flat config, typescript-eslint strict type-checked), run by the quality-kit gate.
- **Formatting is oxfmt's job** (config inherited from Paseo). Don't hand-format and don't argue style.
- **Comments: only when truly necessary.** The default is no comment. Good names and small functions explain the code.
  - Write one only when a reader would otherwise get it wrong: a non-obvious why, a workaround (link the issue), an external constraint (a provider quirk, an OS limit), or a gotcha.
  - No doc comment on every component, hook or function, and none that restates the name or the code. One line beats a paragraph.
  - When you touch a file, delete comments that don't meet this bar.
- **No defensive cruft:** don't guard against cases the types and call sites rule out.
- **No speculative abstraction:** no interface with one implementation, no config for a constant, no helper used once.
- **No dead code** and no `TODO`/"for now" scaffolding. Pull a literal repeated 3+ times into a constant.
- **Tests sit next to the code they test** (`x.test.ts`).
  - Pure logic, parsers and adapters are unit-tested.
  - Providers are tested with the mock provider and recorded fixtures; never call real APIs in tests.
  - A few e2e smoke tests run against a temporary git repo.

## Git

- Conventional commits (`feat(app): …`, `fix(server): …`), small and focused.
- One milestone item per branch.
- Commit only when the user asks, or as part of an approved milestone workflow.

## Review checklist

Covers what tools can't measure:

- [ ] In scope for the current milestone, and not on the out-of-scope list
- [ ] Checked how Paseo handles it (if non-trivial)
- [ ] Views have no logic; logic sits in the paired hook or pure utils
- [ ] Composed with slots; no flag soup, no dot components, no prop drilling past 2 levels
- [ ] Each component has one responsibility; screen orchestrators stay lean
- [ ] Errors are actionable; nothing swallowed; no secrets in logs
- [ ] Only necessary comments: no doc comment restating a name, no narration
- [ ] Gate green, changed screens verified with evidence, ran in the Tauri app
