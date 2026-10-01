import { Fragment } from "react";
import { Box, ChevronRight } from "lucide-react";
import type { FileDiff } from "@/types";
import { DiffStat } from "@/components/ui/DiffStat/DiffStat";
import { symbolOf } from "@/features/workspace/utils/diff";
import { fileName } from "@/features/workspace/utils/language";
import { FileGlyph } from "@/features/workspace/components/editor/FileGlyph/FileGlyph";

const separator = <ChevronRight className="size-3 shrink-0 text-ink-4" />;

/** Where the open file sits: its folders, the file, and the class or function the changes are in. */
export function Breadcrumbs({ file }: { file: FileDiff }) {
  const symbol = symbolOf(file);
  return (
    <nav
      aria-label="Breadcrumbs"
      className="flex h-[26px] shrink-0 items-center gap-1 px-3 text-[12px] whitespace-nowrap text-ink-3"
    >
      {file.path
        .split("/")
        .slice(0, -1)
        .map((folder, i) => (
          <Fragment key={i}>
            <span>{folder}</span>
            {separator}
          </Fragment>
        ))}
      <FileGlyph path={file.path} className="-mx-0.5" />
      <span className="truncate text-ink-2">{fileName(file.path)}</span>
      {symbol && (
        <>
          {separator}
          <Box className="size-3.5 shrink-0" />
          <span className="truncate">{symbol}</span>
        </>
      )}
      <DiffStat
        additions={file.additions}
        deletions={file.deletions}
        className="ml-auto shrink-0 pl-3 text-[11.5px]"
      />
    </nav>
  );
}
