export interface ReviewComment {
  id: string;
  path: string;
  /** The line number in the new file, or in the old one when `side` is `old` (a removed line). */
  line: number;
  side: "new" | "old";
  /** The code the note is about, as the diff shows it. */
  snippet: string;
  text: string;
}
