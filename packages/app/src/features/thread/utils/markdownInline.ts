export type MdInline =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "strong" | "em" | "del"; children: MdInline[] }
  | { type: "link"; href: string; children: MdInline[] };

type Match = [node: MdInline | string, next: number];
type Rule = (text: string, i: number) => Match | null;

const SAFE_HREF = /^(https?:\/\/|mailto:)/i;

export const isSafeHref = (href: string) => SAFE_HREF.test(href);

const isWord = (c: string) => /[\p{L}\p{N}]/u.test(c);
const isBlank = (c: string) => c === "" || /\s/.test(c);

const escape: Rule = (text, i) =>
  text.charAt(i) === "\\" && /[\\`*_~[\]()#>-]/.test(text.charAt(i + 1))
    ? [text.charAt(i + 1), i + 2]
    : null;

const code: Rule = (text, i) => {
  if (text.charAt(i) !== "`") return null;
  const end = text.indexOf("`", i + 1);
  return end > i + 1 ? [{ type: "code", value: text.slice(i + 1, end) }, end + 1] : null;
};

const doubled: Rule = (text, i) => {
  const mark = text.slice(i, i + 2);
  if (mark !== "**" && mark !== "~~") return null;
  const end = text.indexOf(mark, i + 2);
  if (end <= i + 2) return null;
  return [
    {
      type: mark === "**" ? "strong" : "del",
      children: parseInline(text.slice(i + 2, end)),
    },
    end + 2,
  ];
};

function emphasisEnd(text: string, mark: string, from: number): number {
  for (let j = from; j < text.length; j++) {
    const closes = text.charAt(j) === mark && !isBlank(text.charAt(j - 1));
    const lone = text.charAt(j + 1) !== mark && text.charAt(j - 1) !== mark;
    const wordEdge = mark === "_" && isWord(text.charAt(j + 1));
    if (closes && lone && !wordEdge) return j;
  }
  return -1;
}

const emphasis: Rule = (text, i) => {
  const mark = text.charAt(i);
  if ((mark !== "*" && mark !== "_") || text.charAt(i + 1) === mark || isBlank(text.charAt(i + 1)))
    return null;
  if (mark === "_" && isWord(text.charAt(i - 1))) return null;
  const end = emphasisEnd(text, mark, i + 1);
  return end > i + 1
    ? [{ type: "em", children: parseInline(text.slice(i + 1, end)) }, end + 1]
    : null;
};

const link: Rule = (text, i) => {
  if (text.charAt(i) !== "[") return null;
  const m = /^\[([^\]]+)\]\(([^)\s]+)\)/.exec(text.slice(i));
  return m
    ? [{ type: "link", href: m[2] ?? "", children: parseInline(m[1] ?? "") }, i + m[0].length]
    : null;
};

const autolink: Rule = (text, i) => {
  if (isWord(text.charAt(i - 1))) return null;
  const m = /^https?:\/\/[^\s<>]+/i.exec(text.slice(i));
  const url = m?.[0].replace(/[.,;:!?)\]'"]+$/, "") ?? "";
  return url.length > 8
    ? [{ type: "link", href: url, children: [{ type: "text", value: url }] }, i + url.length]
    : null;
};

const RULES: Rule[] = [escape, code, doubled, emphasis, link, autolink];

function pushText(out: MdInline[], value: string) {
  const last = out[out.length - 1];
  if (last?.type === "text") last.value += value;
  else out.push({ type: "text", value });
}

function matchAt(text: string, i: number): Match {
  for (const rule of RULES) {
    const hit = rule(text, i);
    if (hit) return hit;
  }
  return [text.charAt(i), i + 1];
}

/** Forgiving: any delimiter without a closer stays literal. */
export function parseInline(text: string): MdInline[] {
  const out: MdInline[] = [];
  let i = 0;
  while (i < text.length) {
    const hit = matchAt(text, i);
    if (typeof hit[0] === "string") pushText(out, hit[0]);
    else out.push(hit[0]);
    i = hit[1];
  }
  return out;
}
