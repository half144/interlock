import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Joins class names, letting a later Tailwind class win over an earlier one it conflicts with (`p-0` over `p-1`). */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export function ago(min: number) {
  if (min < 1) return "now";
  if (min < 60) return `${Math.round(min)}m`;
  if (min < 60 * 24) return `${Math.floor(min / 60)}h`;
  return `${Math.floor(min / (60 * 24))}d`;
}

/** How long ago an epoch-millisecond timestamp was, in the shortest unit: "now", "5m", "3h", "2d". */
export const since = (at: number) => ago((Date.now() - at) / 60_000);

/** True while focus is in a field, where single-key shortcuts must stay out of the way. */
export const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/** "1 file", "3 files". Pass `many` when the plural isn't just an added s: plural(n, 'agent is', 'agents are'). */
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
