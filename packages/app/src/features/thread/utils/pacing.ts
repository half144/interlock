const WORDS_PER_SECOND_FLOOR = 24;
const WORDS_PER_SECOND_CEILING = 220;
const CATCH_UP = 3;

/** How many words are in the text from `from` on. */
export const countWords = (text: string, from: number) =>
  text.slice(from).split(/\s+/).filter(Boolean).length;

/**
 * How fast to reveal text that has already arrived: a steady reading pace, faster the further behind we are,
 * so a burst from the daemon spreads over a moment without the reply ever lagging far behind it.
 */
export const wordsPerSecond = (behind: number) =>
  Math.min(WORDS_PER_SECOND_CEILING, WORDS_PER_SECOND_FLOOR + behind * CATCH_UP);

/** Moves `words` words forward from `from`, stopping at the end of a word; a word still being written counts as one. */
export function advance(text: string, from: number, words: number) {
  let at = from;
  for (let n = 0; n < words && at < text.length; n++) {
    while (at < text.length && /\s/.test(text.charAt(at))) at++;
    while (at < text.length && !/\s/.test(text.charAt(at))) at++;
  }
  return at;
}

/** One frame of the reveal: how far `from` moves after `elapsedMs`, and the fraction of a word still owed. */
export function paceStep(text: string, from: number, owed: number, elapsedMs: number) {
  const due = owed + (elapsedMs / 1000) * wordsPerSecond(countWords(text, from));
  const words = Math.floor(due);
  return { to: words > 0 ? advance(text, from, words) : from, owed: due - words };
}
