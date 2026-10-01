export type TokenKind =
  | "plain"
  | "keyword"
  | "string"
  | "number"
  | "comment"
  | "fn"
  | "type"
  | "tag";

export interface Token {
  kind: TokenKind;
  text: string;
}

const KEYWORDS = new Set(
  (
    "import export from as const let var function return if else for while of in new await async try catch throw " +
    "type interface extends implements class public private readonly default null undefined true false this typeof " +
    "create table primary key not references index on default select where and or"
  ).split(" "),
);

const PATTERN =
  /(\/\/.*$|--\s.*$|\/\*.*?\*\/|#.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(\b\d[\d_.]*\b)|(<\/?[A-Za-z][\w.]*)|([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$]*)/g;

/** A small single-line highlighter tuned for TS/TSX, SQL and CSS in stub diffs. */
export function highlight(line: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  for (const m of line.matchAll(PATTERN)) {
    const index = m.index ?? 0;
    if (index > last) tokens.push({ kind: "plain", text: line.slice(last, index) });
    const [text, comment, str, num, tag, fn, word] = m;
    let kind: TokenKind = "plain";
    if (comment) kind = "comment";
    else if (str) kind = "string";
    else if (num) kind = "number";
    else if (tag) kind = "tag";
    else if (fn) kind = KEYWORDS.has(fn) ? "keyword" : "fn";
    else if (word) kind = KEYWORDS.has(word) ? "keyword" : /^[A-Z]/.test(word) ? "type" : "plain";
    tokens.push({ kind, text });
    last = index + text.length;
  }
  if (last < line.length) tokens.push({ kind: "plain", text: line.slice(last) });
  return tokens;
}

export const tokenClass: Record<TokenKind, string> = {
  plain: "",
  keyword: "text-syn-keyword",
  string: "text-syn-string",
  number: "text-syn-number",
  comment: "text-syn-comment italic",
  fn: "text-syn-fn",
  type: "text-syn-type",
  tag: "text-syn-tag",
};
