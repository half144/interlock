import type { LogKind, LogLine } from "@/types";
import { cn } from "@/lib/utils";

const kindClass: Record<LogKind, string> = {
  cmd: "text-ink",
  out: "text-ink-2",
  ok: "text-green",
  err: "text-red",
  dim: "text-ink-4",
};

export function TerminalOutput({ lines, live }: { lines: LogLine[]; live: boolean }) {
  return (
    <>
      {lines.length === 0 && <p className="text-ink-4">No output yet.</p>}
      {lines.map((line, i) => (
        <div key={i} className={cn("whitespace-pre-wrap", kindClass[line.kind])}>
          {line.kind === "cmd" && <span className="text-ink-3 select-none">$ </span>}
          {line.text || " "}
        </div>
      ))}
      {live && (
        <span className="mt-1 inline-block h-3.5 w-[7px] animate-lamp-hold bg-run align-middle" />
      )}
    </>
  );
}
