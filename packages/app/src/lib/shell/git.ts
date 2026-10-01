import { search } from "./files";
import {
  act,
  baseName,
  literal,
  look,
  nameList,
  operands,
  short,
  valueOf,
  type CommandSummary,
  type Describe,
} from "./parts";

const GLOBAL_VALUES = ["-C", "-c", "--git-dir", "--work-tree"];

/** What a git subcommand did, for the ones worth naming; the rest show as typed. */
const SUBCOMMANDS = new Map<string, Describe>([
  ["status", () => look("git", "Checked git status")],
  [
    "diff",
    (args) =>
      look(
        "git",
        args.includes("--cached") || args.includes("--staged")
          ? "Looked at the staged diff"
          : "Looked at the diff",
      ),
  ],
  ["log", () => look("git", "Read the git log")],
  ["show", show],
  ["blame", (args) => look("git", "Read the blame for", nameList(operands(args)))],
  ["grep", search],
  ["ls-files", () => look("list", "Listed tracked files")],
  ["remote", () => look("git", "Checked the remotes")],
  ["branch", branch],
  ["add", add],
  ["commit", commit],
  ["checkout", switchTo],
  ["switch", switchTo],
  ["restore", (args) => act("git", "Restored", nameList(operands(args, ["-s", "--source"])))],
  [
    "stash",
    (args) =>
      act(
        "git",
        args[0] === "pop" || args[0] === "apply" ? "Restored stashed changes" : "Stashed changes",
      ),
  ],
  ["push", () => act("git", "Pushed the branch")],
  ["pull", () => act("git", "Pulled changes")],
  ["fetch", () => act("git", "Fetched from the remote")],
]);

function show(args: string[]): CommandSummary {
  const [ref] = operands(args);
  return ref ? literal(look("git", "Looked at", ref)) : look("git", "Looked at the last commit");
}

function branch(args: string[]): CommandSummary | null {
  if (args.includes("--show-current")) return look("git", "Checked the current branch");
  return operands(args).length === 0 ? look("git", "Listed branches") : null;
}

function add(args: string[]): CommandSummary {
  const paths = operands(args);
  const everything = args.includes("-A") || args.includes("--all") || paths.includes(".");
  return act(
    "git",
    everything || paths.length === 0 ? "Staged changes" : "Staged",
    everything ? undefined : nameList(paths),
  );
}

function commit(args: string[]): CommandSummary {
  const message = valueOf(args, ["-m", "--message"]);
  return message
    ? act("git", "Committed", `“${short(message, 48)}”`)
    : act("git", "Committed changes");
}

function switchTo(args: string[]): CommandSummary | null {
  if (args.includes("--")) return null;
  const created = valueOf(args, ["-b", "-B", "-c", "-C"]);
  if (created) return literal(act("git", "Created branch", created));
  const [to] = operands(args);
  return to ? literal(act("git", "Switched to", baseName(to))) : null;
}

export const describeGit: Describe = (args, raw) => {
  const rest = operands(args, GLOBAL_VALUES);
  const at = args.indexOf(rest[0] ?? "");
  const describe = SUBCOMMANDS.get(rest[0] ?? "");
  return describe ? describe(args.slice(at + 1), raw) : null;
};
