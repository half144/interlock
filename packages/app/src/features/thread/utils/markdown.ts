import { parseInline, type MdInline } from "./markdownInline";
import { ITEM, parseList } from "./markdownList";

export { isSafeHref, parseInline, type MdInline } from "./markdownInline";

export interface MdItem {
  checked: boolean | null;
  blocks: MdBlock[];
}

export type MdBlock =
  | { type: "heading"; depth: number; children: MdInline[] }
  | { type: "paragraph"; children: MdInline[] }
  | { type: "list"; ordered: boolean; start: number; items: MdItem[] }
  | { type: "code"; lang: string; value: string }
  | { type: "quote"; blocks: MdBlock[] }
  | { type: "hr" }
  | { type: "table"; head: MdInline[][]; rows: MdInline[][][] };

type Step = [block: MdBlock, next: number];
type BlockRule = (lines: string[], i: number) => Step | null;

const FENCE = /^\s{0,3}(`{3,}|~{3,})\s*([^\s`]*)/;
const HEADING = /^\s{0,3}(#{1,6})\s+(.*?)(?:\s+#+)?\s*$/;
const HR = /^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/;
const QUOTE = /^\s{0,3}>\s?/;
const TABLE_RULE = /^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?\s*$/;

const at = (lines: string[], i: number) => lines[i] ?? "";

function isTableStart(line: string, next: string): boolean {
  return line.includes("|") && next.includes("|") && TABLE_RULE.test(next);
}

function startsBlock(lines: string[], i: number): boolean {
  const line = at(lines, i);
  return (
    [FENCE, HEADING, HR, QUOTE, ITEM].some((re) => re.test(line)) ||
    isTableStart(line, at(lines, i + 1))
  );
}

const splitRow = (line: string) =>
  line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((c) => parseInline(c.trim()));

const isClosingFence = (line: string, marker: string) => {
  const t = line.trim();
  return t.length >= marker.length && t === marker.charAt(0).repeat(t.length);
};

const fence: BlockRule = (lines, i) => {
  const m = FENCE.exec(at(lines, i));
  if (!m) return null;
  const body: string[] = [];
  let j = i + 1;
  while (j < lines.length && !isClosingFence(at(lines, j), m[1] ?? "")) body.push(at(lines, j++));
  return [{ type: "code", lang: m[2] ?? "", value: body.join("\n") }, j + 1];
};

const heading: BlockRule = (lines, i) => {
  const m = HEADING.exec(at(lines, i));
  return m
    ? [
        {
          type: "heading",
          depth: (m[1] ?? "#").length,
          children: parseInline(m[2] ?? ""),
        },
        i + 1,
      ]
    : null;
};

const hr: BlockRule = (lines, i) => (HR.test(at(lines, i)) ? [{ type: "hr" }, i + 1] : null);

const quote: BlockRule = (lines, i) => {
  if (!QUOTE.test(at(lines, i))) return null;
  const inner: string[] = [];
  let j = i;
  while (j < lines.length && QUOTE.test(at(lines, j)))
    inner.push(at(lines, j++).replace(QUOTE, ""));
  return [{ type: "quote", blocks: parseLines(inner) }, j];
};

const list: BlockRule = (lines, i) =>
  ITEM.test(at(lines, i)) ? parseList(lines, i, parseLines) : null;

const table: BlockRule = (lines, i) => {
  if (!isTableStart(at(lines, i), at(lines, i + 1))) return null;
  const rows: MdInline[][][] = [];
  let j = i + 2;
  while (at(lines, j).trim() !== "" && at(lines, j).includes("|"))
    rows.push(splitRow(at(lines, j++)));
  return [{ type: "table", head: splitRow(at(lines, i)), rows }, j];
};

const paragraph: BlockRule = (lines, i) => {
  const para = [at(lines, i).trim()];
  let j = i + 1;
  while (at(lines, j).trim() !== "" && !startsBlock(lines, j)) para.push(at(lines, j++).trim());
  return [{ type: "paragraph", children: parseInline(para.join("\n")) }, j];
};

const RULES: BlockRule[] = [fence, heading, hr, quote, list, table, paragraph];

function parseLines(lines: string[]): MdBlock[] {
  const blocks: MdBlock[] = [];
  let i = 0;
  while (i < lines.length) {
    if (at(lines, i).trim() === "") {
      i++;
      continue;
    }
    for (const rule of RULES) {
      const step = rule(lines, i);
      if (!step) continue;
      blocks.push(step[0]);
      i = step[1];
      break;
    }
  }
  return blocks;
}

export const parseMarkdown = (source: string): MdBlock[] =>
  parseLines(source.replace(/\r\n?/g, "\n").split("\n"));
