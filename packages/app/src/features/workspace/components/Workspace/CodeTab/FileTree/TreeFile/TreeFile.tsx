import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { spring } from "@/lib/motion";
import { gitMark, type TreeNode } from "@/features/workspace/utils/fileTree";
import { FileGlyph } from "@/features/workspace/components/editor/FileGlyph/FileGlyph";

interface TreeFileProps {
  node: TreeNode;
  depth: number;
  selected: boolean;
  onOpen: (pin: boolean) => void;
}

/** A file in the explorer. Changed files open in the editor and wear their git colour and letter, as in VS Code. */
export function TreeFile({ node, depth, selected, onOpen }: TreeFileProps) {
  const mark = node.file && gitMark[node.file.status];

  return (
    <li>
      <button
        type="button"
        disabled={!mark}
        onClick={() => onOpen(false)}
        onDoubleClick={() => onOpen(true)}
        style={{ paddingLeft: 10 + depth * 12 + 18 }}
        className={cn(
          "relative isolate flex h-[22px] w-full items-center gap-1 pr-2.5 text-left disabled:cursor-default",
          mark && !selected && "hover:bg-hover",
        )}
      >
        {selected && (
          <motion.span
            layoutId="file"
            transition={spring}
            className="absolute inset-0 -z-10 bg-selected"
          />
        )}
        <FileGlyph path={node.path} className={cn(!mark && "opacity-50")} />
        <span className={cn("min-w-0 flex-1 truncate", mark ? mark.tone : "text-ink-3")}>
          {node.name}
        </span>
        {mark && (
          <span className={cn("shrink-0 font-mono text-[11px]", mark.tone)}>{mark.letter}</span>
        )}
      </button>
    </li>
  );
}
