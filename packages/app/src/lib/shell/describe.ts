import { FILE_PROGRAMS } from "./files";
import { describeGit } from "./git";
import { act, baseName, type CommandSummary, type Describe } from "./parts";
import type { ShellCommand } from "./parse";
import { SCRIPT_PROGRAMS } from "./scripts";

const PROGRAMS = new Map<string, Describe>([
  ...FILE_PROGRAMS,
  ...SCRIPT_PROGRAMS,
  ["git", describeGit],
]);

/** `rtk` is a token-saving proxy many Claude Code users put in front of every command. */
const WRAPPERS = new Set([
  "sudo",
  "time",
  "command",
  "nice",
  "exec",
  "env",
  "npx",
  "bunx",
  "pnpx",
  "rtk",
]);

/** Commands that print or move around but do nothing worth naming. */
const NOISE = new Set([
  "echo",
  "printf",
  "true",
  ":",
  "cd",
  "pushd",
  "popd",
  "set",
  "sleep",
  "clear",
]);

/** Commands that only reshape what a pipe hands them. */
const FILTERS = new Set([
  "head",
  "tail",
  "grep",
  "egrep",
  "rg",
  "sort",
  "uniq",
  "wc",
  "cut",
  "tr",
  "column",
  "nl",
  "cat",
  "less",
  "more",
  "jq",
  "sed",
  "awk",
]);

/** Drops `sudo`, `time`, `npx -y`, `env FOO=1` and the like from the front of a command. */
function unwrap(argv: string[]): string[] {
  let at = 0;
  let wrapped = false;
  for (; at < argv.length; at++) {
    const arg = argv[at] ?? "";
    if (WRAPPERS.has(arg) || (arg === "proxy" && argv[at - 1] === "rtk")) wrapped = true;
    else if (!/^\w+=/.test(arg) && !(wrapped && arg.startsWith("-"))) break;
  }
  return argv.slice(at);
}

const programOf = (command: ShellCommand) => baseName(unwrap(command.argv)[0] ?? "");

export function isNoise([first, ...rest]: ShellCommand[]): boolean {
  if (first === undefined || rest.length > 0) return false;
  return first.outputs.length === 0 && NOISE.has(programOf(first));
}

const PRINTERS = new Set(["echo", "printf", "cat"]);

/** `echo red > colors.txt` wrote a file; any other redirect we leave to the raw command. */
function wroteFile(command: ShellCommand): CommandSummary | null {
  const [output, ...more] = command.outputs;
  if (!output || more.length > 0 || output.fd !== 1 || !PRINTERS.has(programOf(command))) {
    return null;
  }
  return act("write", output.append ? "Added to" : "Wrote", baseName(output.path));
}

/** One pipeline in a few words, or null when it does something we don't recognise. */
export function describePipeline(pipeline: ShellCommand[]): CommandSummary | null {
  const [first, ...filters] = pipeline;
  if (!first || filters.some((c) => c.outputs.length > 0 || !FILTERS.has(programOf(c)))) {
    return null;
  }
  if (first.outputs.length > 0) return wroteFile(first);
  const [program, ...args] = unwrap(first.argv);
  const describe = PROGRAMS.get(baseName(program ?? ""));
  return describe ? describe(args, first.raw) : null;
}
