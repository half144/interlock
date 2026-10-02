import { describe, expect, it } from "vitest";
import type { FileDiff } from "@/types";
import { ancestorsOf, buildTree, type Listings, type TreeNode } from "./fileTree";

const diff = (path: string, status: FileDiff["status"] = "modified"): FileDiff => ({
  path,
  additions: 1,
  deletions: 0,
  status,
  hunks: [],
});

const names = (nodes: TreeNode[]) => nodes.map((n) => n.name);

describe("ancestorsOf", () => {
  it("lists the folders above a path, outermost first", () => {
    expect(ancestorsOf("a/b/c.ts")).toEqual(["a", "a/b"]);
    expect(ancestorsOf("root.ts")).toEqual([]);
  });
});

describe("buildTree", () => {
  it("shows only the changed files, in their real folders, until the daemon lists more", () => {
    const tree = buildTree([diff("src/lib/util.ts"), diff("README.md", "added")], {});
    expect(names(tree)).toEqual(["src", "README.md"]);
    const lib = tree[0]?.children[0];
    expect(lib?.name).toBe("lib");
    expect(names(lib?.children ?? [])).toEqual(["util.ts"]);
    expect(lib?.children[0]?.file?.path).toBe("src/lib/util.ts");
  });

  it("marks the folders above a change, and only those", () => {
    const listings: Listings = {
      "": [
        { name: "docs", path: "docs", kind: "directory" },
        { name: "src", path: "src", kind: "directory" },
      ],
    };
    const tree = buildTree([diff("src/a.ts")], listings);
    expect(tree.map((n) => [n.name, n.changed])).toEqual([
      ["docs", false],
      ["src", true],
    ]);
  });

  it("merges the real listing with the changes: folders first, then files, by name", () => {
    const listings: Listings = {
      "": [
        { name: "package.json", path: "package.json", kind: "file" },
        { name: "src", path: "src", kind: "directory" },
      ],
      src: [
        { name: "index.ts", path: "src/index.ts", kind: "file" },
        { name: "util.ts", path: "src/util.ts", kind: "file" },
      ],
    };
    const tree = buildTree([diff("src/util.ts"), diff("src/new.ts", "added")], listings);
    expect(names(tree)).toEqual(["src", "package.json"]);
    const src = tree[0];
    expect(names(src?.children ?? [])).toEqual(["index.ts", "new.ts", "util.ts"]);
    expect(src?.children.find((n) => n.name === "util.ts")?.file?.status).toBe("modified");
    expect(src?.children.find((n) => n.name === "index.ts")?.file).toBeUndefined();
  });

  it("keeps a deleted file the listing no longer has", () => {
    const listings: Listings = { "": [{ name: "src", path: "src", kind: "directory" }], src: [] };
    const tree = buildTree([diff("src/gone.ts", "deleted")], listings);
    expect(tree[0]?.children[0]?.file?.status).toBe("deleted");
  });

  it("knows which folders have been listed", () => {
    const tree = buildTree([diff("a/b.ts")], {
      "": [
        { name: "a", path: "a", kind: "directory" },
        { name: "z", path: "z", kind: "directory" },
      ],
    });
    expect(tree.map((n) => [n.name, n.listed])).toEqual([
      ["a", false],
      ["z", false],
    ]);
  });

  it("has nothing without files or listings", () => {
    expect(buildTree([], {})).toEqual([]);
  });

  it("sorts numbered names naturally", () => {
    const tree = buildTree([diff("mod10.ts"), diff("mod2.ts"), diff("mod1.ts")], {});
    expect(names(tree)).toEqual(["mod1.ts", "mod2.ts", "mod10.ts"]);
  });

  it("shares a row between a folder and the only folder it holds", () => {
    const listings: Listings = {
      "": [{ name: "src", path: "src", kind: "directory" }],
      src: [{ name: "lib", path: "src/lib", kind: "directory" }],
      "src/lib": [
        { name: "a.ts", path: "src/lib/a.ts", kind: "file" },
        { name: "b.ts", path: "src/lib/b.ts", kind: "file" },
      ],
    };
    const [merged] = buildTree([diff("src/lib/a.ts")], listings);
    expect(merged?.name).toBe("src/lib");
    expect(merged?.path).toBe("src/lib");
    expect(names(merged?.children ?? [])).toEqual(["a.ts", "b.ts"]);
  });

  it("keeps a folder apart while its other contents are unknown", () => {
    const [src] = buildTree([diff("src/lib/a.ts")], {});
    expect(src?.name).toBe("src");
  });
});
