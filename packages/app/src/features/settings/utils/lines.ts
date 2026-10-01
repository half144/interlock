export const linesOf = (text: string): string[] =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

/** Copied files are paths inside the repo; the daemon rejects absolute paths and `..`. */
const isRepoRelative = (path: string) =>
  !path.startsWith("/") && !/^[A-Za-z]:/u.test(path) && !path.split(/[\\/]/u).includes("..");

export const outsideRepo = (lines: string[]): string | undefined =>
  lines.find((line) => !isRepoRelative(line));
