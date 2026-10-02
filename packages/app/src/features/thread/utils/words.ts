/** A text split into words and the whitespace between them, so joining the pieces gives the text back. */
export const splitWords = (text: string) => text.split(/(\s+)/).filter(Boolean);

export const isSpace = (token: string) => /^\s+$/.test(token);
