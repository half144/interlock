/** The project's default branch first, then the rest in the order the daemon ranked them, without repeats. */
export function orderBranches(defaultBranch: string, found: string[], query: string): string[] {
  const showDefault = defaultBranch.toLowerCase().includes(query.trim().toLowerCase());
  return [...new Set([...(showDefault ? [defaultBranch] : []), ...found])];
}
