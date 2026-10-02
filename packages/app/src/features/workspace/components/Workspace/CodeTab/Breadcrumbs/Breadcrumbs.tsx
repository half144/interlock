import { Fragment } from "react";
import { Box, ChevronRight } from "lucide-react";
import type { FileDiff } from "@/types";
import { DiffStat } from "@/components/ui/DiffStat/DiffStat";
import { symbolOf } from "@/features/workspace/utils/diff";
import { ancestorsOf } from "@/features/workspace/utils/fileTree";
import { fileName } from "@/features/workspace/utils/language";
import { FileGlyph } from "@/features/workspace/components/editor/FileGlyph/FileGlyph";

const separator = <ChevronRight className="size-3 shrink-0 text-ink-4" />;

/** Where the open file sits: its folders, the file, and the class or function the changes are in. */
export function Breadcrumbs({ file }: { file: FileDiff }) {
  const symbol = symbolOf(file);
  return (
    <nav
      aria-label="Breadcrumbs"
      className="flex h-[26px] shrink-0 items-center gap-3 px-3 text-[12px] whitespace-nowrap text-ink-3"
    >
      <div className="flex min-w-0 flex-1 items-center gap-1 overflow-hidden">
        {ancestorsOf(file.path).map((folder) => (
          <Fragment key={folder}>
            <span className="min-w-0 truncate">{fileName(folder)}</span>
            {separator}
          </Fragment>
        ))}
        <FileGlyph path={file.path} className="-mx-0.5" />
        <span className="shrink-0 text-ink-2">{fileName(file.path)}</span>
        {symbol && (
          <>
            {separator}
            <Box className="size-3.5 shrink-0" />
            <span className="truncate">{symbol}</span>
          </>
        )}
      </div>
      <DiffStat
        additions={file.additions}
        deletions={file.deletions}
        className="shrink-0 text-[11.5px]"
      />
    </nav>
  );
}
