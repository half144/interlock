import { useState } from "react";
import type { TreeNode } from "@/features/workspace/utils/fileTree";
import { TreeFile } from "./TreeFile/TreeFile";
import { TreeFolder } from "./TreeFolder/TreeFolder";

interface FileTreeProps {
  nodes: TreeNode[];
  selected: string | null;
  /** A single click previews the file, a double click keeps its tab open. */
  onOpen: (path: string, pin: boolean) => void;
  depth?: number;
}

export function FileTree({ nodes, selected, onOpen, depth = 0 }: FileTreeProps) {
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  return (
    <ul>
      {nodes.map((node) =>
        node.children ? (
          <TreeFolder
            key={node.path}
            name={node.name}
            depth={depth}
            open={!closed[node.path]}
            onToggle={() => setClosed((c) => ({ ...c, [node.path]: !c[node.path] }))}
          >
            <FileTree nodes={node.children} selected={selected} onOpen={onOpen} depth={depth + 1} />
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
