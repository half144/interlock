# 0030 Daemon release bundle

Status: accepted (2026-10-01)

The release app ships its own Node and a bundled daemon, so it needs nothing installed on the user's machine.

- `npm run bundle:daemon -w @interlock/desktop` (`apps/desktop/scripts/bundle-daemon.mjs`) stages `src-tauri/resources/runtime/`.
- `node/bin/node` is the official Node 22.13.1 darwin-arm64 binary. The archive is cached in `~/Library/Caches/interlock-build` (override with `INTERLOCK_BUILD_CACHE`) and checked against a SHA-256 pinned in the script; a mismatch aborts.
- `daemon/` holds esbuild bundles of the supervisor (`index.mjs`), the worker (`daemon-worker.mjs`) and the terminal worker (`terminal-worker-process.js`), a `package.json` (`@interlock/server`, `type: module`) for version lookup, the shell-integration scripts, and `node_modules/node-pty` reduced to `lib` and the darwin-arm64 prebuild. node-pty is the only external.
- `npm run build:desktop` bundles the daemon, then runs `tauri build` (which builds the app). No signing or notarization yet (W4).
- Apple Silicon only, as the spec says.
