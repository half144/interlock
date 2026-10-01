import { ago } from "@/lib/utils";

const HOME = /^\/(?:Users|home)\/[^/]+/;

export const folderName = (path: string) => path.slice(path.lastIndexOf("/") + 1);

/** The folder a repository sits in, with the home folder written as `~`. */
export const parentFolder = (path: string) =>
  path.slice(0, path.lastIndexOf("/")).replace(HOME, "~") || "/";

/** "just now", "5m ago", "3h ago", "2d ago". */
export function lastActive(at: number, now: number): string {
  const elapsed = ago((now - at) / 60_000);
  return elapsed === "now" ? "just now" : `${elapsed} ago`;
}
