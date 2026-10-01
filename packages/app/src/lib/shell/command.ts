import { describePipeline, isNoise } from "./describe";
import { parseShell, type Pipeline } from "./parse";
import { act, literal, look, nameList, short, type CommandSummary } from "./parts";

/** Past this, a joined sentence no longer reads at a glance and the summary falls back to its main act. */
const SENTENCE_MAX = 64;

function dropDo(pipeline: Pipeline): Pipeline {
  const [first, ...rest] = pipeline;
  if (first?.argv[0] !== "do") return pipeline;
  return first.argv.length > 1 ? [{ ...first, argv: first.argv.slice(1) }, ...rest] : rest;
}

function substitute(pipeline: Pipeline, name: string, value: string): Pipeline {
  const variable = new RegExp(`\\$\\{?${name}\\}?(?!\\w)`, "g");
  return pipeline.map((c) => ({ ...c, argv: c.argv.map((arg) => arg.replace(variable, value)) }));
}

/** `for f in a b; do cat "$f"; done` as `cat a; cat b`. */
function unrollLoop(pipelines: Pipeline[], at: number) {
  const [, name = "", word, ...items] = pipelines[at]?.[0]?.argv ?? [];
  const end = pipelines.findIndex((p, i) => i > at && p[0]?.argv[0] === "done");
  if (!/^\w+$/.test(name) || word !== "in" || end < 0) return null;
  const body = pipelines.slice(at + 1, end).map(dropDo);
  return { end, pipelines: items.flatMap((item) => body.map((p) => substitute(p, name, item))) };
}

function unroll(pipelines: Pipeline[]): Pipeline[] | null {
  const out: Pipeline[] = [];
  for (let at = 0; at < pipelines.length; at++) {
    const pipeline = pipelines[at] ?? [];
    if (pipeline[0]?.argv[0] !== "for") {
      out.push(pipeline);
      continue;
    }
    const loop = unrollLoop(pipelines, at);
    if (!loop) return null;
    out.push(...loop.pipelines);
    at = loop.end;
  }
  return out.filter((p) => p.length > 0);
}

const sentence = (s: CommandSummary) => (s.target ? `${s.verb} ${s.target}` : s.verb);

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

/** "Listed files and read README.md": every part in one line, or null when that gets too long. */
function joined(parts: CommandSummary[]): string | null {
  const phrases = parts.map((p, i) => (i === 0 ? sentence(p) : lowerFirst(sentence(p))));
  const last = phrases.pop() ?? "";
  const text = phrases.length > 0 ? `${phrases.join(", ")} and ${last}` : last;
  return text.length <= SENTENCE_MAX ? text : null;
}

/** All the reads in one "Read a, b and c", where the first read was; repeated phrases once. */
function merge(parts: CommandSummary[]): CommandSummary[] {
  const files = [
    ...new Set(parts.flatMap((p) => (p.verb === "Read" ? (p.explored?.files ?? []) : []))),
  ];
  const firstRead = parts.findIndex((p) => p.verb === "Read");
  const merged = parts.flatMap((p, i) => {
    if (p.verb !== "Read") return [p];
    return i === firstRead ? [look("read", "Read", nameList(files), files)] : [];
  });
  return merged.filter((p, i) => merged.findIndex((q) => sentence(q) === sentence(p)) === i);
}

function combine(parts: CommandSummary[]): CommandSummary {
  const [first] = parts;
  if (first && parts.length === 1) return first;
  const text = joined(parts);
  const main = parts.find((p) => !p.explored);
  if (main) return text ? act(main.kind, text) : main;
  const files = [...new Set(parts.flatMap((p) => p.explored?.files ?? []))];
  const explored = { files, looks: parts.flatMap((p) => p.explored?.looks ?? []) };
  if (text) return { kind: "explore", verb: text, explored };
  return files.length > 0
    ? { kind: "explore", verb: "Explored", target: nameList(files), explored }
    : { kind: "explore", verb: "Explored the project", explored };
}

const ran = (raw: string) => literal(act("run", "Ran", short(raw, 48)));

/**
 * A shell command line as a person would say it: `ls && head -60 README.md && cat package.json`
 * becomes "Listed files and read README.md, package.json". When any part is unfamiliar, it says
 * "Ran" with that part as typed, so it never claims more than it knows.
 */
export function describeCommand(command: string): CommandSummary {
  const parsed = parseShell(command);
  const pipelines = parsed && unroll(parsed);
  if (!pipelines) return ran(command.split("\n")[0] ?? command);
  const meaningful = pipelines.filter((p) => !isNoise(p));
  if (meaningful.length === 0) return ran(command);
  const parts: CommandSummary[] = [];
  for (const pipeline of meaningful) {
    const part = describePipeline(pipeline);
    if (!part) return ran(pipeline[0]?.raw ?? command);
    parts.push(part);
  }
  return combine(merge(parts));
}
