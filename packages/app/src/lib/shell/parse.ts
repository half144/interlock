/** Where a redirection sends a stream: `> notes.txt` is fd 1, `2>> err.log` fd 2 appending. */
interface Output {
  path: string;
  append: boolean;
  fd: number;
}

export interface ShellCommand {
  argv: string[];
  /** The command as typed, for showing it when it can't be described. */
  raw: string;
  /** The files it writes through redirections; `/dev/null` doesn't count. */
  outputs: Output[];
}

/** Commands joined by pipes; the list a command line splits into at `&&`, `||`, `;` and newlines. */
export type Pipeline = ShellCommand[];

interface State {
  source: string;
  pipelines: Pipeline[];
  pipeline: ShellCommand[];
  argv: string[];
  token: string | null;
  start: number;
  outputs: Output[];
  redirect: Omit<Output, "path"> | "in" | null;
}

function endToken(s: State) {
  if (s.token === null) return;
  if (s.redirect === null) s.argv.push(s.token);
  else if (s.redirect !== "in" && s.token !== "/dev/null") {
    s.outputs.push({ path: s.token, ...s.redirect });
  }
  s.redirect = null;
  s.token = null;
}

function endCommand(s: State, end: number) {
  endToken(s);
  if (s.argv.length > 0) {
    s.pipeline.push({ argv: s.argv, raw: s.source.slice(s.start, end).trim(), outputs: s.outputs });
  }
  s.argv = [];
  s.outputs = [];
  s.start = end + 1;
}

function endPipeline(s: State, end: number) {
  endCommand(s, end);
  if (s.pipeline.length > 0) s.pipelines.push(s.pipeline);
  s.pipeline = [];
}

/** Handles `>`, `>>`, `2>`, `2>&1`, `&>` and `<`; returns the index of the last character it used. */
function redirect(s: State, at: number): number {
  const fd = s.token !== null && /^\d+$/.test(s.token) ? Number(s.token) : 1;
  if (fd !== 1 || s.token === "1") s.token = null;
  endToken(s);
  const append = s.source[at + 1] === ">";
  let i = append ? at + 1 : at;
  if (s.source[i + 1] === "&") {
    i++;
    while (/\d/.test(s.source[i + 1] ?? "")) i++;
    return i;
  }
  s.redirect = s.source[at] === "<" ? "in" : { fd, append };
  return i;
}

function quoted(s: State, at: number, quote: string): number | null {
  let i = at + 1;
  s.token ??= "";
  for (; i < s.source.length && s.source[i] !== quote; i++) {
    const c = s.source[i];
    if (quote === '"' && (c === "`" || (c === "$" && s.source[i + 1] === "("))) return null;
    if (quote === '"' && c === "\\") i++;
    s.token += s.source[i] ?? "";
  }
  return i < s.source.length ? i : null;
}

const unreadable = (c: string | undefined, next: string | undefined) =>
  c === "(" || c === ")" || c === "`" || (c === "$" && next === "(") || (c === "<" && next === "<");

function separate(s: State, at: number): number {
  const c = s.source[at];
  const next = s.source[at + 1];
  if (c === "|" && next !== "|") {
    endCommand(s, at);
    return at;
  }
  endPipeline(s, at);
  if (!((c === "&" || c === "|") && next === c)) return at;
  s.start = at + 2;
  return at + 1;
}

/** Returns the index of the last character the operator used, or null for what we don't read. */
function operator(s: State, at: number): number | null {
  const c = s.source[at];
  const next = s.source[at + 1];
  if (unreadable(c, next)) return null;
  if (c === ">" || c === "<") return redirect(s, at);
  if (c === "&" && next === ">") return redirect(s, at + 1);
  return separate(s, at);
}

const OPERATORS = new Set(["|", "&", ";", "\n", "<", ">", "(", ")", "`"]);

function escaped(s: State, at: number): number {
  if (s.source[at + 1] !== "\n") s.token = (s.token ?? "") + (s.source[at + 1] ?? "");
  return at + 1;
}

function comment(source: string, at: number): number {
  const newline = source.indexOf("\n", at);
  return (newline < 0 ? source.length : newline) - 1;
}

/** Reads the character at `at`; returns the index of the last character it used. */
function step(s: State, at: number): number | null {
  const c = s.source[at] ?? "";
  if (c === "'" || c === '"') return quoted(s, at, c);
  if (c === "\\") return escaped(s, at);
  if (c === "#" && s.token === null) return comment(s.source, at);
  if (c === " " || c === "\t") {
    endToken(s);
    return at;
  }
  if (OPERATORS.has(c) || s.source.startsWith("$(", at)) return operator(s, at);
  s.token = (s.token ?? "") + c;
  return at;
}

/**
 * Splits a command line the way a shell would, without running anything. Returns null for what it
 * can't read safely: subshells, command substitution, heredocs and unbalanced quotes.
 */
export function parseShell(source: string): Pipeline[] | null {
  const s: State = {
    source,
    pipelines: [],
    pipeline: [],
    argv: [],
    token: null,
    start: 0,
    outputs: [],
    redirect: null,
  };
  for (let i = 0; i < source.length; i++) {
    const end = step(s, i);
    if (end === null) return null;
    i = end;
  }
  endPipeline(s, source.length);
  return s.pipelines;
}
