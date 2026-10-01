import type { MdBlock, MdItem } from "./markdown";

export const ITEM = /^(\s*)([-*+]|\d{1,9}[.)])\s+(.*)$/;

const indentOf = (line: string) => line.length - line.trimStart().length;
const at = (lines: string[], i: number) => lines[i] ?? "";
const nextNonBlank = (lines: string[], from: number) =>
  lines.slice(from).find((x) => x.trim() !== "");

/** Lines belonging to one item: everything indented deeper than its marker. */
function itemBody(lines: string[], from: number, base: number, offset: number): [string[], number] {
  const body: string[] = [];
  let i = from;
  while (i < lines.length) {
    const line = at(lines, i);
    const blank = line.trim() === "";
    const after = blank ? nextNonBlank(lines, i) : line;
    if (after === undefined || indentOf(after) <= base) break;
    body.push(blank ? "" : line.slice(Math.min(indentOf(line), offset)));
    i++;
  }
  return [body, i];
}

function toItem(first: string, rest: string[], parse: (l: string[]) => MdBlock[]): MdItem {
  const task = /^\[([ xX])\]\s+/.exec(first);
  const head = task ? first.slice(task[0].length) : first;
  return {
    checked: task ? task[1] !== " " : null,
    blocks: parse([head, ...rest]),
  };
}

function skipBlanksBeforeItem(lines: string[], from: number): number {
  const after = nextNonBlank(lines, from);
  let i = from;
  if (after !== undefined && ITEM.test(after)) while (at(lines, i).trim() === "") i++;
  return i;
}

function markerOf(line: string) {
  const m = ITEM.exec(line);
  return m ? { indent: (m[1] ?? "").length, marker: m[2] ?? "-", text: m[3] ?? "" } : null;
}

export function parseList(
  lines: string[],
  start: number,
  parse: (lines: string[]) => MdBlock[],
): [MdBlock, number] {
  const first = markerOf(at(lines, start));
  const ordered = /\d/.test(first?.marker ?? "-");
  const items: MdItem[] = [];
  let i = start;
  for (
    let m = markerOf(at(lines, i));
    m && /\d/.test(m.marker) === ordered;
    m = markerOf(at(lines, i))
  ) {
    if (m.indent > (first?.indent ?? 0) + 1) break;
    const [rest, next] = itemBody(lines, i + 1, m.indent, m.indent + m.marker.length + 1);
    items.push(toItem(m.text, rest, parse));
    i = skipBlanksBeforeItem(lines, next);
  }
  return [
    {
      type: "list",
      ordered,
      start: ordered ? parseInt(first?.marker ?? "1", 10) : 1,
      items,
    },
    i,
  ];
}
