import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { checkDotComponents, checkProps } from "./structure/components.mjs";
import { isTest, loadSources } from "./structure/files.mjs";
import { checkImports } from "./structure/imports.mjs";
import { checkLayout } from "./structure/layout.mjs";

export function checkStructure(srcRoot) {
  const sources = loadSources(srcRoot);
  const tests = new Set(sources.filter((s) => isTest(s.file)).map((s) => s.rel));
  const views = sources.filter((s) => s.rel.endsWith(".tsx") && !tests.has(s.rel));
  return [
    ...checkLayout(sources, tests),
    ...checkImports(sources, tests),
    ...views.flatMap((source) => [...checkDotComponents(source), ...checkProps(source)]),
  ];
}

function main() {
  const srcRoot = resolve(process.argv[2] ?? "packages/app/src");
  if (!existsSync(srcRoot)) {
    console.log(`structure: ${srcRoot} does not exist yet, nothing to check.`);
    return;
  }
  const violations = checkStructure(srcRoot);
  for (const { message } of violations) console.error(`structure: ${message}`);
  if (violations.length > 0) {
    console.error(
      `\nstructure: ${violations.length} violation(s). Rules: docs/spec-v1.md section 8.`,
    );
    process.exitCode = 1;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
