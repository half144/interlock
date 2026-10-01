#!/usr/bin/env bash
# Stages the daemon runtime for the Tauri bundle (W4). Layout read by src-tauri/src/daemon.rs:
#   src-tauri/resources/runtime/node/bin/node   Node runtime (darwin-arm64)
#   src-tauri/resources/runtime/daemon/index.mjs  daemon bundle + prebuilt node-pty
# Not implemented yet: needs the daemon bundler from @interlock/server.
set -euo pipefail
echo "bundle:daemon is not implemented yet (W4)" >&2
exit 1
