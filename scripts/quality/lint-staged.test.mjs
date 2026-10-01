import { test } from "node:test";
import assert from "node:assert/strict";
import { groupFiles } from "./lint-staged.mjs";

test("groups staged files by workspace", () => {
  const groups = groupFiles([
    "packages/app/a.ts",
    "packages/server/b.ts",
    "packages/app/c.ts",
    "scripts/x.mjs",
  ]);
  assert.deepEqual(groups, [
    ["packages/app/a.ts", "packages/app/c.ts"],
    ["packages/server/b.ts"],
    ["scripts/x.mjs"],
  ]);
});

test("splits a large workspace into chunks of 80", () => {
  const files = Array.from({ length: 170 }, (_, i) => `packages/server/f${i}.ts`);
  const sizes = groupFiles(files).map((chunk) => chunk.length);
  assert.deepEqual(sizes, [80, 80, 10]);
});
