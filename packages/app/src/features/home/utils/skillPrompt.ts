/** The prompt with `/name` at its start, replacing a skill already there; the rest of the text stays. */
export function withSkill(text: string, name: string, skills: string[]): string {
  const lead = /^\/(\S+)\s*/.exec(text);
  const rest = lead && skills.includes(lead[1] ?? "") ? text.slice(lead[0].length) : text;
  return `/${name} ${rest}`;
}
