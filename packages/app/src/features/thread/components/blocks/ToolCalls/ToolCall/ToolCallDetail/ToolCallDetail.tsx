import type { ToolDetail } from "@/types";
import { CommandOutput } from "./CommandOutput/CommandOutput";
import { DiffLines } from "./DiffLines/DiffLines";

/** What a call saw, in a scrolling well: the command and its output, the diff, or the text it read. */
export function ToolCallDetail({ detail }: { detail: ToolDetail }) {
  return (
    <div className="mt-1.5 mb-1 max-h-72 w-full overflow-auto rounded-xl bg-inset py-2.5 font-mono text-[12px] leading-[1.7]">
      {detail.type === "command" && (
        <CommandOutput command={detail.command} output={detail.output} />
      )}
      {detail.type === "diff" && <DiffLines lines={detail.lines} />}
      {detail.type === "text" && <p className="px-3.5 whitespace-pre text-ink-2">{detail.text}</p>}
    </div>
  );
}
