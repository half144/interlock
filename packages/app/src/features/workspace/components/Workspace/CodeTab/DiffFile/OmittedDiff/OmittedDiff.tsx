import type { FileDiff } from "@/types";

const REASONS: Record<NonNullable<FileDiff["omitted"]>, string> = {
  binary: "This is a binary file, so there is no text diff to show.",
  too_large: "This file changed too much to show its diff here.",
};

export function OmittedDiff({ reason }: { reason: NonNullable<FileDiff["omitted"]> }) {
  return <p className="px-4 py-6 text-[13px] text-ink-3">{REASONS[reason]}</p>;
}
