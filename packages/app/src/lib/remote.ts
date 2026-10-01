/** `git@github.com:owner/repo.git` and `https://github.com/owner/repo` both read `owner/repo`. */
export function remoteLabel(url: string): string {
  const path = url
    .replace(/^[a-z+]+:\/\/[^/]+\//i, "")
    .replace(/^[^@/]+@[^:]+:/, "")
    .replace(/\.git$/, "");
  return path.split("/").slice(-2).join("/");
}
