import type { ToolName } from "@/types";
import { cn } from "@/lib/utils";

const diffTone = (line: string) =>
  line.startsWith("+")
    ? "bg-add/10 text-add"
    : line.startsWith("-")
      ? "bg-del/10 text-del"
      : "text-ink-3";

/** One line of what a tool call saw, styled for its kind: file excerpt, search hit, diff or command output. */
export function ToolLine({
  kind,
  line,
  n,
}: {
  kind: ToolName;
  line: string;
  n?: number | undefined;
}) {
  // A read without a starting line number is a diff, not a file excerpt.
  if (kind === "edit" || (kind === "read" && n === undefined))
    return <p className={cn("px-3 whitespace-pre", diffTone(line))}>{line || " "}</p>;
  if (kind === "read")
    return (
      <p className="flex whitespace-pre">
        <span className="w-10 shrink-0 pr-3 text-right text-ink-4 select-none">{n}</span>
        <span className="pr-3 text-ink-2">{line || " "}</span>
      </p>
    );
  if (kind === "search") {
    const [where, ...rest] = line.split("  ");
    return (
      <p className="truncate px-3">
        <span className="text-run">{where}</span>
        <span className="text-ink-3"> {rest.join("  ").trim()}</span>
      </p>
    );
  }
  return (
    <p
      className={cn(
        "px-3 whitespace-pre",
        /✓/.test(line) ? "text-green" : /×|FAIL|Error/.test(line) ? "text-red" : "text-ink-2",
      )}
    >
      {line || " "}
    </p>
  );
}
