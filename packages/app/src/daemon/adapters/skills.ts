import type { Skill } from "@/types";

interface CommandsPayload {
  commands: { name: string; description: string; kind?: string | undefined }[];
  error: string | null;
}

/** The skills among a provider's slash commands, by name. Built-ins like `/compact` are not skills. */
export function toSkills({ commands, error }: CommandsPayload): Skill[] {
  if (error) throw new Error(error);
  return commands
    .filter((c) => c.kind === "skill")
    .map((c) => ({ name: c.name, description: c.description }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
