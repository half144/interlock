import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Joins class names, letting a later Tailwind class win over an earlier one it conflicts with (`p-0` over `p-1`). */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const byId = <T extends { id: string }>(list: T[]) =>
  Object.fromEntries(list.map((x) => [x.id, x])) as Record<string, T>;

export function ago(min: number) {
  if (min < 1) return "now";
  if (min < 60) return `${Math.round(min)}m`;
  if (min < 60 * 24) return `${Math.floor(min / 60)}h`;
  return `${Math.floor(min / (60 * 24))}d`;
}

export function tokens(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

/** True while focus is in a field, where single-key shortcuts must stay out of the way. */
export const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

export const usd = (n: number) => `$${n.toFixed(2)}`;

/** "1 file", "3 files". Pass `many` when the plural isn't just an added s: plural(n, 'agent is', 'agents are'). */
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
