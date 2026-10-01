interface Language {
  name: string;
  /** The short mark file icons use in editors: TS, {}, SQL. */
  glyph: string;
  tone: string;
}

const TS: Language = { name: "TypeScript", glyph: "TS", tone: "text-lang-ts" };
const JS: Language = { name: "JavaScript", glyph: "JS", tone: "text-lang-json" };
const MARKUP = "text-lang-md";

const LANGUAGES: Record<string, Language> = {
  ts: TS,
  mts: TS,
  cts: TS,
  tsx: { ...TS, name: "TypeScript JSX" },
  js: JS,
  mjs: JS,
  cjs: JS,
  jsx: { ...JS, name: "JavaScript JSX" },
  json: { name: "JSON", glyph: "{}", tone: "text-lang-json" },
  sql: { name: "SQL", glyph: "SQL", tone: "text-lang-sql" },
  md: { name: "Markdown", glyph: "M↓", tone: "text-lang-md" },
  css: { name: "CSS", glyph: "#", tone: MARKUP },
  html: { name: "HTML", glyph: "<>", tone: MARKUP },
  yml: { name: "YAML", glyph: "YML", tone: MARKUP },
  yaml: { name: "YAML", glyph: "YML", tone: MARKUP },
  toml: { name: "TOML", glyph: "TML", tone: MARKUP },
  py: { name: "Python", glyph: "PY", tone: "text-lang-ts" },
  rs: { name: "Rust", glyph: "RS", tone: "text-lang-sql" },
  go: { name: "Go", glyph: "GO", tone: "text-lang-ts" },
  sh: { name: "Shell", glyph: "SH", tone: "text-ink-3" },
};

const PLAIN: Language = { name: "Plain Text", glyph: "≡", tone: "text-ink-4" };

export function languageOf(path: string): Language {
  const dot = path.lastIndexOf(".");
  if (dot < path.lastIndexOf("/")) return PLAIN;
  return LANGUAGES[path.slice(dot + 1).toLowerCase()] ?? PLAIN;
}

export const fileName = (path: string) => path.slice(path.lastIndexOf("/") + 1);
