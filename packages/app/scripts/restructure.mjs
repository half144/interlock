// One-off codemod: X.tsx -> X/X.tsx for every component, nesting private pieces
// inside their only consumer, then rewriting every import (alias and relative).
// Usage: node scripts/restructure.mjs [--dry]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");
const dry = process.argv.includes("--dry");
const EXTS = [".ts", ".tsx"];
const SPEC = /(\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)(['"])([^'"\n]+)\2/g;

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });

const files = walk(SRC).filter((f) => EXTS.includes(path.extname(f)));
const fileSet = new Set(files);

function resolve(from, spec) {
  let base;
  if (spec.startsWith("@/")) base = path.join(SRC, spec.slice(2));
  else if (spec.startsWith(".")) base = path.resolve(path.dirname(from), spec);
  else return null;
  for (const c of [
    base,
    ...EXTS.map((e) => base + e),
    ...EXTS.map((e) => path.join(base, "index" + e)),
  ]) {
    if (fileSet.has(c)) return c;
  }
  return null;
}

const importers = new Map(files.map((f) => [f, new Set()]));
for (const f of files) {
  for (const m of fs.readFileSync(f, "utf8").matchAll(SPEC)) {
    const t = resolve(f, m[3]);
    if (t && t !== f) importers.get(t).add(f);
  }
}

const rel = (f) => path.relative(SRC, f);
const componentRoot = (f) => {
  const r = rel(f).split(path.sep);
  if (r[0] === "components") return "components";
  if (r[0] === "features" && r[2] === "components")
    return path.join("features", r[1], "components");
  return null;
};
const inScope = (f) => componentRoot(f) !== null;
const isComponent = (f) => inScope(f) && f.endsWith(".tsx");
const stem = (f) => path.basename(f, path.extname(f));

const moves = new Map();
const notes = [];

function targetOf(f) {
  if (moves.has(f)) return moves.get(f);
  moves.set(f, null);
  const dir = path.dirname(f);
  const name = stem(f);
  const owners = [...importers.get(f)].filter(
    (i) => isComponent(i) && componentRoot(i) === componentRoot(f),
  );
  const soleOwner = importers.get(f).size === 1 && owners.length === 1 ? owners[0] : null;
  let target;
  if (isComponent(f)) {
    const parent = soleOwner && targetOf(soleOwner);
    const base = parent ? path.dirname(parent) : dir;
    target = path.join(base, name, name + ".tsx");
  } else if (soleOwner) {
    const parent = targetOf(soleOwner);
    target = path.join(path.dirname(parent), path.basename(f));
  } else if (importers.get(f).size === 0) {
    target = f;
    notes.push(`unused helper left in place: ${rel(f)}`);
  } else {
    const root = componentRoot(f);
    const home = root === "components" ? "lib" : path.join(path.dirname(root), "utils");
    target = path.join(SRC, home, path.basename(f));
    if (fileSet.has(target)) throw new Error(`collision: ${rel(target)}`);
    notes.push(`shared helper ${rel(f)} -> ${rel(target)}`);
  }
  moves.set(f, target);
  return target;
}

for (const f of files.filter(inScope)) targetOf(f);
const finalPath = (f) => moves.get(f) ?? f;

function rewrite(file, spec, orig) {
  const target = resolve(file, spec);
  if (!target) return spec;
  const newFile = finalPath(file);
  const newTarget = finalPath(target);
  const noExt = (p) => p.replace(/\.(tsx?)$/, "");
  const keepIndex =
    /\/index$/.test(spec) ||
    (fs.existsSync(path.join(path.dirname(target), "index.ts")) && stem(target) === "index");
  const wanted = keepIndex ? path.dirname(newTarget) : noExt(newTarget);
  if (spec.startsWith("@/")) return "@/" + path.relative(SRC, wanted).split(path.sep).join("/");
  let r = path.relative(path.dirname(newFile), wanted).split(path.sep).join("/");
  if (!r.startsWith(".")) r = "./" + r;
  return r.startsWith("../../") ? "@/" + path.relative(SRC, wanted).split(path.sep).join("/") : r;
}

const out = new Map();
for (const f of files) {
  const text = fs.readFileSync(f, "utf8");
  out.set(
    f,
    text.replace(SPEC, (all, pre, q, spec) => `${pre}${q}${rewrite(f, spec)}${q}`),
  );
}

let moved = 0;
for (const [f, t] of moves) if (t !== f) moved++;
console.log(`moving ${moved} files`);
notes.forEach((n) => console.log(n));
if (dry) process.exit(0);

for (const f of files) {
  const t = finalPath(f);
  fs.mkdirSync(path.dirname(t), { recursive: true });
  fs.writeFileSync(t, out.get(f));
  if (t !== f) fs.rmSync(f);
}
