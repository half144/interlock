import assert from "node:assert/strict";
import { test } from "node:test";
import { scopeOf } from "./scope.mjs";

const dirs = (files) => scopeOf(files).workspaces;

test("an app-only change leaves the daemon alone", () => {
  assert.deepEqual(dirs(["packages/app/src/x.ts"]), ["packages/app"]);
});

test("a protocol change reaches everything built on it", () => {
  assert.deepEqual(dirs(["packages/protocol/src/messages.ts"]).sort(), [
    "packages/app",
    "packages/client",
    "packages/protocol",
    "packages/server",
  ]);
});

test("a root config can break any workspace", () => {
  const scope = scopeOf(["eslint.config.js"]);
  assert.equal(scope.full, true);
  assert.equal(scope.workspaces.length, 5);
});

test("docs and the Tauri shell touch no JS workspace", () => {
  assert.deepEqual(dirs(["docs/spec-v1.md", "README.md", "apps/desktop/src-tauri/main.rs"]), []);
});
