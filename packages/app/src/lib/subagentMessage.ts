/** The provider takes no message for a subagent: the words go to the main agent, naming the subagent they are about. */
export const aboutSubagent = (name: string, text: string) => `About subagent "${name}":\n\n${text}`;
