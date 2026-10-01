type DiffLineKind = "ctx" | "add" | "del";

export interface DiffLine {
  kind: DiffLineKind;
  text: string;
  oldNo?: number;
  newNo?: number;
}

export interface Hunk {
  header: string;
  lines: DiffLine[];
}

export interface FileDiff {
  path: string;
  oldPath?: string;
  additions: number;
  deletions: number;
  status: "modified" | "added" | "deleted";
  /** Set when the daemon sent no hunks for the file. */
  omitted?: "binary" | "too_large";
  hunks: Hunk[];
}
