import { basename, dirname, extname } from "node:path";

const COMPONENT_EXT = /\.tsx$/;
const HOOK_NAME = /^use([A-Z]\w*)\.tsx?$/;

const isComponentsTree = (rel) => rel.split("/").includes("components");
const stem = (file) => basename(file, extname(file));

function ownerFolder(rel, folders) {
  let dir = dirname(rel);
  while (dir !== "." && basename(dir) !== "components") {
    if (folders.has(dir)) return dir;
    dir = dirname(dir);
  }
  return null;
}

function checkComponentFile(rel, violations) {
  const dir = basename(dirname(rel));
  if (dir === "components") {
    violations.push({
      file: rel,
      message: `${rel} sits loose in components/. Move it to ${stem(rel)}/${basename(rel)}.`,
    });
  } else if (dir !== stem(rel)) {
    violations.push({
      file: rel,
      message: `${rel}: a component lives in a folder named after it. Move it to ${stem(rel)}/${basename(rel)}.`,
    });
  }
}

export function checkLayout(sources, tests) {
  const violations = [];
  const rels = sources.map((s) => s.rel);
  const componentFolders = new Set(
    rels
      .filter((rel) => isComponentsTree(rel) && COMPONENT_EXT.test(rel) && !tests.has(rel))
      .filter((rel) => basename(dirname(rel)) === stem(rel))
      .map((rel) => dirname(rel)),
  );

  for (const rel of rels.filter(isComponentsTree)) {
    const name = basename(rel);
    if (stem(rel) === "index") {
      violations.push({
        file: rel,
        message: `${rel} is a barrel. Delete it and import X/X directly.`,
      });
    } else if (HOOK_NAME.test(name)) {
      checkHook(rel, name, componentFolders, violations);
    } else if (tests.has(rel) || !COMPONENT_EXT.test(rel)) {
      if (!ownerFolder(rel, componentFolders)) {
        violations.push({
          file: rel,
          message: `${rel} sits outside a component folder. Put it next to the component it belongs to (X/${name}) or move it to hooks/ or utils/.`,
        });
      }
    } else {
      checkComponentFile(rel, violations);
    }
  }
  return violations;
}

function checkHook(rel, name, componentFolders, violations) {
  const target = name.match(HOOK_NAME)?.[1];
  const dir = dirname(rel);
  if (basename(dir) !== target || !componentFolders.has(dir)) {
    violations.push({
      file: rel,
      message: `${rel}: a hook inside components/ is the logic of one component and lives in ${target}/ beside ${target}.tsx. For a hook shared by several components, move it to hooks/.`,
    });
  }
}
