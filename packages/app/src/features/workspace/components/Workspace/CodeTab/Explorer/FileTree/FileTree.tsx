import { useState } from "react";
import type { TreeNode } from "@/features/workspace/utils/fileTree";
import { TreeFile } from "./TreeFile/TreeFile";
import { TreeFolder } from "./TreeFolder/TreeFolder";

interface FileTreeProps {
  nodes: TreeNode[];
  selected: string | null;
  /** A single click previews the file, a double click keeps its tab open. */
  onOpen: (path: string, pin: boolean) => void;
  /** Asks for a folder's contents the first time it opens. */
  onLoad: (path: string) => void;
  depth?: number;
}

export function FileTree({ nodes, selected, onOpen, onLoad, depth = 0 }: FileTreeProps) {
  // A folder holding changes starts open and any other starts closed; this records the ones you flipped.
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  return (
    <ul>
      {nodes.map((node) =>
        node.kind === "folder" ? (
          <TreeFolder
            key={node.path}
            name={node.name}
            depth={depth}
            changed={node.changed}
            open={node.changed !== Boolean(flipped[node.path])}
            onToggle={() => {
              setFlipped((f) => ({ ...f, [node.path]: !f[node.path] }));
              if (!node.listed) onLoad(node.path);
            }}
          >
            <FileTree
              nodes={node.children}
              selected={selected}
              onOpen={onOpen}
              onLoad={onLoad}
              depth={depth + 1}
            />
          </TreeFolder>
        ) : (
          <TreeFile
            key={node.path}
            node={node}
            depth={depth}
            selected={selected === node.path}
            onOpen={(pin) => onOpen(node.path, pin)}
          />
        ),
      )}
    </ul>
  );
}
