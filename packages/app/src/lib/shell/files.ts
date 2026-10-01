import {
  act,
  baseName,
  isHere,
  literal,
  look,
  nameList,
  operands,
  short,
  valueOf,
  type CommandSummary,
  type Describe,
} from "./parts";

const COUNT_FLAGS = ["-n", "-c"];

const readFiles = (files: string[]) =>
  files.length > 0 ? look("read", "Read", nameList(files), files) : null;

const read: Describe = (args) => readFiles(operands(args));

const readCount: Describe = (args) => readFiles(operands(args, COUNT_FLAGS));

/** `sed -n 60,121p README.md` reads; `sed -i` edits in place. */
const sed: Describe = (args) => {
  const scripted = args.includes("-e") || args.includes("--expression");
  const rest = operands(args, ["-e", "--expression", "-f"]).filter(Boolean);
  const files = scripted ? rest : rest.slice(1);
  if (files.length === 0) return null;
  const inPlace = args.some((arg) => arg.startsWith("-i") || arg === "--in-place");
  return inPlace ? act("edit", "Edited", nameList(files)) : readFiles(files);
};

const jq: Describe = (args) => readFiles(operands(args, ["--arg", "--argjson"]).slice(1));

const list: Describe = (args) => {
  const dirs = operands(args, ["-I", "-L", "--ignore"]).filter((dir) => !isHere(dir));
  return dirs.length > 0
    ? look("list", "Listed", short(dirs.join(", "), 40))
    : look("list", "Listed files");
};

const FIND_ACTIONS = new Set(["-exec", "-execdir", "-delete", "-ok", "-okdir", "-fprint", "-fls"]);

const find: Describe = (args) => {
  if (args.some((arg) => FIND_ACTIONS.has(arg))) return null;
  const pattern = valueOf(args, ["-name", "-iname"]);
  if (pattern) return literal(look("search", "Found files matching", pattern));
  const first = args.findIndex((arg) => arg.startsWith("-") || arg === "!" || arg === "(");
  return list(first < 0 ? args : args.slice(0, first), "");
};

const fd: Describe = (args) => {
  const [pattern] = operands(args, ["-e", "--extension", "-t", "--type", "-d", "--max-depth"]);
  return pattern
    ? literal(look("search", "Found files matching", pattern))
    : look("list", "Listed files");
};

const SEARCH_VALUES = [
  "-e",
  "--regexp",
  "-f",
  "-g",
  "--glob",
  "-t",
  "--type",
  "-T",
  "--type-not",
  "-A",
  "-B",
  "-C",
  "-m",
  "--max-count",
  "--context",
  "--after-context",
  "--before-context",
];

export const search: Describe = (args) => {
  if (args.includes("--files")) return look("list", "Listed files");
  const explicit = valueOf(args, ["-e", "--regexp"]);
  const rest = operands(args, SEARCH_VALUES);
  const pattern = explicit ?? rest[0];
  if (!pattern) return null;
  const paths = (explicit === undefined ? rest.slice(1) : rest).filter((path) => !isHere(path));
  const where = paths.length > 0 ? ` in ${short(paths.join(", "), 32)}` : "";
  return look("search", "Searched for", `“${short(pattern, 40)}”${where}`);
};

const compare: Describe = (args) => {
  const [a, b] = operands(args);
  return a && b ? look("read", "Compared", `${baseName(a)} and ${baseName(b)}`, [a, b]) : null;
};

const SENDS = new Set(["-X", "--request", "-d", "--data", "--data-raw", "-F", "--form", "-T"]);
const SAVES = new Set(["-o", "-O", "--output", "--remote-name"]);

const fetchUrl: Describe = (args) => {
  if (args.some((arg) => SENDS.has(arg) || SAVES.has(arg))) return null;
  const host = args.map((arg) => /^https?:\/\/([^/?#]+)/.exec(arg)?.[1]).find(Boolean);
  return host ? act("fetch", "Fetched", host) : null;
};

const named =
  (kind: CommandSummary["kind"], verb: string): Describe =>
  (args) => {
    const paths = operands(args);
    return paths.length > 0 ? act(kind, verb, nameList(paths)) : null;
  };

const moved =
  (verb: string): Describe =>
  (args) => {
    const paths = operands(args, ["-t", "--target-directory"]);
    const to = paths.at(-1);
    if (paths.length < 2 || !to) return null;
    return act("edit", verb, `${nameList(paths.slice(0, -1))} to ${to}`);
  };

export const FILE_PROGRAMS: [string, Describe][] = [
  ["cat", read],
  ["less", read],
  ["more", read],
  ["bat", read],
  ["nl", read],
  ["wc", read],
  ["head", readCount],
  ["tail", readCount],
  ["sed", sed],
  ["jq", jq],
  ["ls", list],
  ["tree", list],
  ["find", find],
  ["fd", fd],
  ["rg", search],
  ["grep", search],
  ["egrep", search],
  ["ag", search],
  ["ack", search],
  ["diff", compare],
  ["curl", fetchUrl],
  ["wget", fetchUrl],
  ["mkdir", named("write", "Created")],
  ["touch", named("write", "Created")],
  ["rm", named("edit", "Deleted")],
  ["mv", moved("Moved")],
  ["cp", moved("Copied")],
];
