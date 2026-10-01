export const slashCommands = [
  { name: "/plan", hint: "Draft a plan before touching code" },
  { name: "/review", hint: "AI review of the current diff" },
  { name: "/handoff", hint: "Hand this chat to another agent" },
  { name: "/checkpoint", hint: "Save a checkpoint of the worktree" },
  { name: "/btw", hint: "Side question, kept out of context" },
];

export type SlashCommand = (typeof slashCommands)[number];

/** Commands matching a lone slash word, like `/pl`; anything else typed means no menu. */
export const matchSlash = (text: string) =>
  /^\/\S*$/.test(text) ? slashCommands.filter((c) => c.name.startsWith(text.toLowerCase())) : [];
