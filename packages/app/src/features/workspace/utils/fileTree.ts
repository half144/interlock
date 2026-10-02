import type { FileDiff } from "@/types";

export interface TreeNode {
  name: string;
  path: string;
  kind: "file" | "folder";
  children: TreeNode[];
  /** The diff of a changed file. */
  file?: FileDiff;
  /** A folder that holds a changed file somewhere below it. */
  changed: boolean;
  /** Whether the folder's real contents are known, or only the changed files seen through it. */
  listed: boolean;
}

interface ListedEntry {
  name: string;
  path: string;
  kind: "file" | "directory";
}

/** The real contents of the folders the daemon has listed, by folder path ("" is the root). */
export type Listings = Record<string, ListedEntry[]>;

const parentOf = (path: string) => path.slice(0, Math.max(0, path.lastIndexOf("/")));
const nameOf = (path: string) => path.slice(path.lastIndexOf("/") + 1);

/** The folders above a path, outermost first: `a/b/c.ts` gives `a` and `a/b`. */
export const ancestorsOf = (path: string) =>
  path
    .split("/")
    .slice(0, -1)
    .map((_, i, parts) => parts.slice(0, i + 1).join("/"));

const byKindThenName = (a: TreeNode, b: TreeNode) =>
  Number(b.kind === "folder") - Number(a.kind === "folder") ||
  a.name.localeCompare(b.name, undefined, { numeric: true });

/** Like VS Code's compact folders: a folder that holds nothing but one folder shares a row with it. */
function compact(node: TreeNode): TreeNode {
  const children = node.children.map(compact);
  const only = children[0];
  if (node.kind === "folder" && node.listed && children.length === 1 && only?.kind === "folder") {
    return { ...only, name: `${node.name}/${only.name}` };
  }
  return { ...node, children };
}

/**
 * The worktree as it is: the folders the daemon listed, with the changed files in their real places. A
 * changed file the listing lacks (a deleted one) still shows, and nothing is invented around them.
 */
export function buildTree(files: FileDiff[], listings: Listings): TreeNode[] {
  const nodes = new Map<string, TreeNode>();
  const root: TreeNode = {
    name: "",
    path: "",
    kind: "folder",
    children: [],
    changed: false,
    listed: "" in listings,
  };
  nodes.set("", root);

  const place = (path: string, kind: TreeNode["kind"]): TreeNode => {
    const known = nodes.get(path);
    if (known) return known;
    const node: TreeNode = {
      name: nameOf(path),
      path,
      kind,
      children: [],
      changed: false,
      listed: path in listings,
    };
    nodes.set(path, node);
    place(parentOf(path), "folder").children.push(node);
    return node;
  };

  for (const [dir, entries] of Object.entries(listings)) {
    place(dir, "folder");
    for (const entry of entries) place(entry.path, entry.kind === "directory" ? "folder" : "file");
  }
  for (const file of files) {
    place(file.path, "file").file = file;
    for (const folder of ancestorsOf(file.path)) place(folder, "folder").changed = true;
  }

  for (const node of nodes.values()) node.children.sort(byKindThenName);
  return root.children.map(compact);
}

/** The git decoration VS Code puts on a changed file: its letter, and the colour its name takes. */
export const gitMark: Record<FileDiff["status"], { letter: string; tone: string }> = {
  added: { letter: "A", tone: "text-add" },
  modified: { letter: "M", tone: "text-mod" },
  deleted: { letter: "D", tone: "text-del" },
};
