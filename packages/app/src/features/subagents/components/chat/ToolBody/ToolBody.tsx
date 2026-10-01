import type { ToolEvent } from "@/lib/tools";
import { cn } from "@/lib/utils";
import { ToolLine } from "./ToolLine/ToolLine";

/** What a tool call actually saw: the file lines, the search hits, the command output or the diff. */
export function ToolBody({ call, className }: { call: ToolEvent; className?: string }) {
  if (!call.body?.length) return null;
  return (
    <div
      className={cn(
        "overflow-auto rounded-lg bg-inset py-2 font-mono text-[12px] leading-[1.7]",
        className,
      )}
    >
      {call.kind === "bash" && <p className="px-3 whitespace-pre text-ink">$ {call.text}</p>}
      {call.body.map((line, i) => (
        <ToolLine
          key={i}
          kind={call.kind}
          line={line}
          n={call.from === undefined ? undefined : call.from + i}
        />
      ))}
    </div>
  );
}
