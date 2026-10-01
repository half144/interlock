import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import ts from "typescript";

const SKIP_DIRS = new Set(["node_modules", "dist", "build", "coverage"]);
const SOURCE_FILE = /\.(ts|tsx|mts|cts)$/;
const TEST_FILE = /\.(test|spec)\.(ts|tsx)$/;

export function isTest(file) {
  return TEST_FILE.test(file) || file.split(sep).includes("__tests__");
}

export function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

export function loadSources(srcRoot) {
  return listFiles(srcRoot)
    .filter((file) => SOURCE_FILE.test(file))
    .map((file) => {
      const text = readFileSync(file, "utf8");
      const kind = file.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
      const ast = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, kind);
      return { file, rel: relative(srcRoot, file).split(sep).join("/"), ast };
    });
}

export function importSpecifiers(ast) {
  const specs = [];
  const visit = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      specs.push(node.moduleSpecifier.text);
    } else if (ts.isCallExpression(node)) {
      const [arg] = node.arguments;
      const isImport = node.expression.kind === ts.SyntaxKind.ImportKeyword;
      const isRequire = ts.isIdentifier(node.expression) && node.expression.text === "require";
      if ((isImport || isRequire) && arg && ts.isStringLiteral(arg)) specs.push(arg.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  return specs;
}
