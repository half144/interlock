import { basename, dirname, join, normalize } from "node:path";
import { importSpecifiers } from "./files.mjs";

const EXTENSIONS = [".ts", ".tsx", ".mts", ".cts"];
const PAIRED_HOOK = /^use([A-Z]\w*)\.tsx?$/;
const REACT = /^(react|react-dom)(\/|$)/;
const PURE_DIR = /(^|\/)(lib|utils)\//;

function resolve(spec, fromRel) {
  const base = spec.startsWith("@/")
    ? spec.slice(2)
    : spec.startsWith(".")
      ? join(dirname(fromRel), spec)
      : null;
  if (base === null) return null;
  const clean = normalize(base)
    .split("\\")
    .join("/")
    .replace(/\.(js|jsx)$/, "");
  return [clean, ...EXTENSIONS.map((ext) => clean + ext)];
}

function pairedHooks(sources) {
  const hooks = new Map();
  for (const { rel } of sources) {
    const target = basename(rel).match(PAIRED_HOOK)?.[1];
    if (target && basename(dirname(rel)) === target) hooks.set(rel, target);
  }
  return hooks;
}

export function checkImports(sources, tests) {
  const violations = [];
  const known = new Set(sources.map((s) => s.rel));
  const hooks = pairedHooks(sources);

  for (const { rel, ast } of sources) {
    const specs = importSpecifiers(ast);

    if (PURE_DIR.test(rel) && !tests.has(rel)) {
      for (const spec of specs.filter((s) => REACT.test(s))) {
        violations.push({
          file: rel,
          message: `${rel} imports "${spec}", but utils/ and lib/ are pure. Move the React code to a hook, or the file out of utils/lib.`,
        });
      }
    }

    for (const spec of specs) {
      const target = resolve(spec, rel)?.find((candidate) => known.has(candidate));
      if (!target) continue;
      checkHookImport({ rel, target, hooks, tests, violations });
    }
  }
  return violations;
}

function checkHookImport({ rel, target, hooks, tests, violations }) {
  const hookOwner = hooks.get(target);
  if (hookOwner) {
    const allowed = join(dirname(target), `${hookOwner}.tsx`).split("\\").join("/");
    const isOwnTest = tests.has(rel) && dirname(rel) === dirname(target);
    if (rel !== allowed && !isOwnTest) {
      violations.push({
        file: rel,
        message: `${rel} imports ${basename(target)}, the private hook of ${hookOwner}.tsx. Only ${hookOwner}.tsx may import it; to share the logic move it to hooks/ with a generic name.`,
      });
    }
    return;
  }
  const importerHook = hooks.get(rel);
  if (importerHook && target === join(dirname(rel), `${importerHook}.tsx`).split("\\").join("/")) {
    violations.push({
      file: rel,
      message: `${rel} imports its own component ${importerHook}.tsx. Layers go one way: X.tsx -> useX.ts -> utils/. Pass what the hook needs as arguments.`,
    });
  }
}
