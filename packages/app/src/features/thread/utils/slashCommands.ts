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

const MAX_MENU_ITEMS = 8;

/** Commands matching a lone slash word, like `/pl`; anything else typed means no menu. */
export const matchSlash = (commands: SlashCommand[], text: string) =>
  /^\/\S*$/.test(text)
    ? commands
        .filter((c) => c.name.toLowerCase().startsWith(text.toLowerCase()))
        .slice(0, MAX_MENU_ITEMS)
    : [];

/** A message that starts with a command: which one, and what is left to send. */
export function parseSlash(commands: SlashCommand[], text: string) {
  const [word = "", ...rest] = text.trim().split(/\s+/);
  const command = commands.find((c) => c.name === word.toLowerCase());
  return command ? { command, rest: rest.join(" ") } : null;
}
