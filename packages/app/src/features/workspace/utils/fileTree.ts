import type { FileDiff } from "@/types";

export interface TreeNode {
  name: string;
  path: string;
  children?: TreeNode[];
  file?: FileDiff;
}

const ROOT_FILES = ["package.json", "README.md", "tsconfig.json"];

const sibling = (folder: string) =>
  folder === "migrations" ? "0141_payout_status.sql" : "index.ts";

/** Builds a believable repo tree around the changed files: their folders, a sibling each, and the usual root files. */
export function buildTree(files: FileDiff[]): TreeNode[] {
  const root: TreeNode = { name: "", path: "", children: [] };
  const folder = (parent: TreeNode, name: string) => {
    let node = parent.children!.find((c) => c.name === name && c.children);
    if (!node) {
      node = { name, path: parent.path ? `${parent.path}/${name}` : name, children: [] };
      parent.children!.push(node);
    }
    return node;
  };

  for (const file of files) {
    const parts = file.path.split("/");
    const name = parts.pop()!;
    const dir = parts.reduce(folder, root);
    dir.children!.push({ name, path: file.path, file });
    const extra = sibling(parts[parts.length - 1] ?? "");
    if (parts.length && !dir.children!.some((c) => c.name === extra))
      dir.children!.push({ name: extra, path: `${dir.path}/${extra}` });
  }
  for (const name of ROOT_FILES) root.children!.push({ name, path: name });

  const sort = (nodes: TreeNode[]): TreeNode[] =>
    nodes
      .map((n) => (n.children ? { ...n, children: sort(n.children) } : n))
      .sort(
        (a, b) =>
          Number(Boolean(b.children)) - Number(Boolean(a.children)) || a.name.localeCompare(b.name),
      );
  return sort(root.children!);
}

/** The git decoration VS Code puts on a changed file: its letter, and the colour its name takes. */
export const gitMark: Record<FileDiff["status"], { letter: string; tone: string }> = {
  added: { letter: "A", tone: "text-add" },
  modified: { letter: "M", tone: "text-mod" },
  deleted: { letter: "D", tone: "text-del" },
};
