import type { Skill } from "@/types";

export interface SlashCommand {
  name: string;
  hint: string;
}

const PLAN: SlashCommand = { name: "/plan", hint: "Plan the next request before touching code" };

/** Only the commands that do something: `/plan` switches the agent into plan mode, where its provider has one. */
export const commandsFor = (canPlan: boolean): SlashCommand[] => (canPlan ? [PLAN] : []);

export const skillCommands = (skills: Skill[]): SlashCommand[] =>
  skills.map((s) => ({ name: `/${s.name}`, hint: s.description }));

/** `/agent-browser` reads as "Agent Browser"; a plugin's `/plugin:skill` as "Skill". */
export function commandLabel(name: string) {
  const bare = name.slice(1).split(":").pop() ?? "";
  return bare
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Where a plugin's skill comes from, shown beside it; null for the project's and the user's own. */
export function commandSource(name: string) {
  const [plugin, skill] = name.slice(1).split(":");
  return skill === undefined ? null : `From ${plugin}`;
}

export const slashOptionId = (index: number) => `slash-option-${index}`;

/** Commands matching a lone slash word, like `/pl`; anything else typed means no menu. */
export const matchSlash = (commands: SlashCommand[], text: string) =>
  /^\/\S*$/.test(text)
    ? commands.filter((c) => c.name.toLowerCase().startsWith(text.toLowerCase()))
    : [];

/** A message that starts with a command: which one, and what is left to send. */
export function parseSlash(commands: SlashCommand[], text: string) {
  const [word = "", ...rest] = text.trim().split(/\s+/);
  const command = commands.find((c) => c.name === word.toLowerCase());
  return command ? { command, rest: rest.join(" ") } : null;
}
