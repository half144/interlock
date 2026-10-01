interface Language {
  name: string;
  /** The short mark file icons use in editors: TS, {}, SQL. */
  glyph: string;
  tone: string;
}

const LANGUAGES: Record<string, Language> = {
  ts: { name: "TypeScript", glyph: "TS", tone: "text-lang-ts" },
  tsx: { name: "TypeScript JSX", glyph: "TS", tone: "text-lang-ts" },
  sql: { name: "SQL", glyph: "SQL", tone: "text-lang-sql" },
  json: { name: "JSON", glyph: "{}", tone: "text-lang-json" },
  md: { name: "Markdown", glyph: "M↓", tone: "text-lang-md" },
};

const PLAIN: Language = { name: "Plain Text", glyph: "≡", tone: "text-ink-4" };

export const languageOf = (path: string) =>
  LANGUAGES[path.slice(path.lastIndexOf(".") + 1)] ?? PLAIN;

export const fileName = (path: string) => path.slice(path.lastIndexOf("/") + 1);
