import type { UsageTone } from "@/lib/usage";

/** Colour only when a window is running out, on the server's own thresholds (amber from 70% used, red past 90%). */
export const toneText: Record<UsageTone, string> = {
  default: "",
  ok: "",
  warning: "text-hold",
  danger: "text-red",
};

export const toneFill: Record<UsageTone, string> = {
  default: "bg-ink-3",
  ok: "bg-ink-3",
  warning: "bg-hold",
  danger: "bg-red",
};
