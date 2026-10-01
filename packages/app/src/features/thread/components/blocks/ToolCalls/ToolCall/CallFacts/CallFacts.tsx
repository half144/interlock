import type { ToolChip } from "@/types";

/** What trails a call: a count, the lines it changed, and how it failed or stopped. */
export function CallFacts({ chip }: { chip: ToolChip }) {
  return (
    <>
      {chip.meta && <span className="shrink-0 text-[12px] text-ink-3">{chip.meta}</span>}
      {chip.stat && (
        <span className="shrink-0 font-mono text-[11.5px] tabular-nums">
          <span className="text-add">+{chip.stat.additions}</span>
          {chip.stat.deletions > 0 && <span className="text-del"> −{chip.stat.deletions}</span>}
        </span>
      )}
      {chip.failure && (
        <span className="shrink-0 font-mono text-[11.5px] text-red">{chip.failure}</span>
      )}
      {chip.status === "stopped" && (
        <span className="shrink-0 text-[12px] text-ink-3">stopped</span>
      )}
    </>
  );
}
