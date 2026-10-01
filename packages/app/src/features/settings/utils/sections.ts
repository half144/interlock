/** The settings page's sections, in scroll order; `id` matches each section's anchor. */
const SECTIONS = [
  { id: "general", label: "General" },
  { id: "environment", label: "Environment" },
  { id: "scripts", label: "Scripts" },
  { id: "agents", label: "Agents" },
  { id: "danger", label: "Danger zone" },
];

/** Environment and Scripts feed the worktree setup, which a plain folder never has. */
export const sectionsFor = (git: boolean) =>
  git ? SECTIONS : SECTIONS.filter((s) => s.id !== "environment" && s.id !== "scripts");
