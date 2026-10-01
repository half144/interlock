import type { Explored } from "@/types";

export type CommandKind =
  | "read"
  | "list"
  | "search"
  | "explore"
  | "git"
  | "edit"
  | "write"
  | "run"
  | "test"
  | "install"
  | "fetch";

/** A command line in a few words: "Read README.md, package.json", "Ran tests". */
export interface CommandSummary {
  kind: CommandKind;
  verb: string;
  target?: string;
  /** The target is literal text (a command, a glob), set in mono. */
  literal?: boolean;
  /** Set when it only looked around: read, listed, searched or checked git. */
  explored?: Explored;
}

export type Describe = (args: string[], raw: string) => CommandSummary | null;

const withTarget = (target: string | undefined) => (target ? { target } : {});

const looksOf = (kind: CommandKind): Explored["looks"] =>
  kind === "search" || kind === "list" || kind === "git" ? [kind] : [];

/** A command that only looks. */
export const look = (
  kind: CommandKind,
  verb: string,
  target?: string,
  files: string[] = [],
): CommandSummary => ({
  kind,
  verb,
  ...withTarget(target),
  explored: { files, looks: looksOf(kind) },
});

/** A command that changes something or runs code. */
export const act = (kind: CommandKind, verb: string, target?: string): CommandSummary => ({
  kind,
  verb,
  ...withTarget(target),
});

export const literal = (summary: CommandSummary): CommandSummary => ({ ...summary, literal: true });

/** The arguments that aren't flags, skipping the value of each flag in `takesValue`. */
export function operands(args: string[], takesValue: readonly string[] = []): string[] {
  const end = args.indexOf("--");
  const head = end < 0 ? args : args.slice(0, end);
  const out = head.filter(
    (arg, i) => !(arg.startsWith("-") && arg.length > 1) && !takesValue.includes(head[i - 1] ?? ""),
  );
  return end < 0 ? out : [...out, ...args.slice(end + 1)];
}

/** The value of the first of `flags` present (`-name '*.md'` gives `*.md`). */
export function valueOf(args: string[], flags: readonly string[]): string | undefined {
  const at = args.findIndex((arg) => flags.includes(arg));
  return at < 0 ? undefined : args[at + 1];
}

export const baseName = (path: string) => path.split("/").filter(Boolean).at(-1) ?? path;

export const isHere = (path: string) => path === "." || path === "./";

/** "a.ts, b.ts", up to three names, then "a.ts, b.ts and 3 more". */
export function nameList(paths: string[]): string {
  const names = [...new Set(paths)].map(baseName);
  if (names.length <= 3) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} and ${names.length - 2} more`;
}

/** One line, cut with an ellipsis past `max` characters. */
export function short(text: string, max = 60): string {
  const flat = text.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}
