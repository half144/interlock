# Interlock

A local desktop app that orchestrates your own coding agents. Give a task to **Claude Code** or **Codex**, let it work in an isolated git worktree, review the diff, and open a pull request, all from one calm window on your Mac.

Interlock runs entirely on your machine. It talks to the Claude and Codex CLIs you already have signed in, and keeps its state in `~/.interlock`.

![Home](docs/screenshots/home.png)

## What it does

- **One task, one worktree.** Every task runs on its own branch (`agent/<id>-<slug>`, renamed by AI once the work is clear), so agents never step on each other or on your checkout.
- **Claude Code and Codex, side by side.** Real model and reasoning-effort lists straight from each provider, with in-app sign-in.
- **Plans and progress you can follow.** Native plan tools are enabled for both agents; the conversation shows the steps, and a card behind the composer tracks `n / m`.
- **A readable transcript.** Tool calls read as sentences ("Read 2 files, searched 4 times", "Ran tests", "Edited package.json +2 −1"), exploration collapses into groups, failures stay quiet, and every call expands to its command, output or diff.
- **Review in place.** A file tree and unified or split diff, a terminal in the task's worktree, and Create PR with CI checks through `gh`.
- **Remaining usage at a glance.** The pill in the corner shows how much of your Claude and Codex plans is left, from the providers' own usage APIs.
- **Add any folder.** Projects come from the repositories on your Mac, a folder picker, or drag and drop.

| Plans and steps                    | Review                                 |
| ---------------------------------- | -------------------------------------- |
| ![Plan](docs/screenshots/plan.png) | ![Review](docs/screenshots/review.png) |

| Tool calls as sentences              | Usage                                |
| ------------------------------------ | ------------------------------------ |
| ![Steps](docs/screenshots/steps.png) | ![Usage](docs/screenshots/usage.png) |

## Architecture

A Tauri v2 shell supervises a local Node daemon and renders a React app.

| Path                                   | What it is                                                              |
| -------------------------------------- | ----------------------------------------------------------------------- |
| `apps/desktop`                         | Tauri shell: bundles the daemon, menu bar, notifications, folder picker |
| `packages/app`                         | React 19, Vite, Tailwind v4, zustand                                    |
| `packages/server`                      | The daemon: agents, worktrees, terminals, usage, project settings       |
| `packages/protocol`, `packages/client` | Wire schemas and the client the app uses                                |

The daemon listens on `127.0.0.1` with a bearer token. The app only knows protocol shapes inside `src/daemon/` and Tauri-versus-browser differences inside `src/platform/`.

The daemon, protocol and client are a fork of [Paseo](https://github.com/getpaseo/paseo) (Apache-2.0); divergences are tracked in [`docs/upstream-sync.md`](docs/upstream-sync.md).

## Develop

Requirements: macOS on Apple silicon, Node 22, Rust, and the Claude and Codex CLIs signed in. `gh` is needed for pull requests.

```sh
npm install
npm run dev:desktop     # Tauri window with hot reload
npm run dev:app         # the UI alone in a browser (needs VITE_DAEMON_URL and VITE_DAEMON_TOKEN)
npm run dev:daemon      # the daemon alone
npm run build:desktop   # unsigned Interlock.app and .dmg
```

## Quality gate

`npm run check` runs formatting (oxfmt), type-aware ESLint with a baseline that can only shrink, strictest TypeScript, structure rules, knip, duplicate detection and the tests. Git hooks run the same checks, and `--no-verify` is not an option. Conventions for people and agents live in [`CLAUDE.md`](CLAUDE.md); the product spec is [`docs/spec-v1.md`](docs/spec-v1.md) and the decisions behind it are in [`docs/decisions`](docs/decisions).

## Status

Early and in active development, built for one person's daily use first. macOS only for now. Not signed or notarized.

## License

Apache-2.0. See [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE).
