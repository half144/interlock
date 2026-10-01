import type { Aspect } from "@/types";

export const aspectMeta: Record<
  Aspect,
  { label: string; text: string; bg: string; stroke: string }
> = {
  running: { label: "Running", text: "text-run", bg: "bg-run", stroke: "var(--color-run)" },
  held: { label: "Needs you", text: "text-hold", bg: "bg-hold", stroke: "var(--color-hold)" },
  queued: { label: "Queued", text: "text-ink-3", bg: "bg-ink-4", stroke: "var(--color-ink-3)" },
  review: {
    label: "Ready for review",
    text: "text-ready",
    bg: "bg-ready",
    stroke: "var(--color-ready)",
  },
  idle: { label: "Idle", text: "text-ink-3", bg: "bg-ink-4", stroke: "var(--color-ink-3)" },
  merged: { label: "Merged", text: "text-merge", bg: "bg-merge", stroke: "var(--color-merge)" },
  failed: { label: "Failed", text: "text-red", bg: "bg-red", stroke: "var(--color-red)" },
  discarded: {
    label: "Discarded",
    text: "text-ink-3",
    bg: "bg-ink-4",
    stroke: "var(--color-ink-4)",
  },
};
