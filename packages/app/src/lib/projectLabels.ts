import type { Project } from "@/types";

type Named = Pick<Project, "id" | "name" | "rootPath">;

const parentsOf = (path: string) => path.split("/").filter(Boolean).slice(0, -1).reverse();

const labelAt = (name: string, parents: string[], depth: number) =>
  `${name} · ${parents.slice(0, depth).reverse().join("/")}`;

/** Projects that share a name tell apart by the closest parent folders that differ: "app · work", "app · play". */
export function projectLabels(projects: Named[]): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const project of projects) {
    const twins = projects.filter((p) => p.name === project.name);
    if (twins.length === 1) {
      labels[project.id] = project.name;
      continue;
    }
    const all = twins.map((p) => parentsOf(p.rootPath));
    const deepest = Math.max(...all.map((p) => p.length));
    let depth = 1;
    while (
      depth < deepest &&
      new Set(all.map((p) => labelAt(project.name, p, depth))).size < twins.length
    ) {
      depth++;
    }
    labels[project.id] = labelAt(project.name, parentsOf(project.rootPath), depth);
  }
  return labels;
}
