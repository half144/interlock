const SETTLE_MS = 110;
const DONE_WITHIN = 0.5;

/**
 * How far the view moves this frame toward the bottom of the conversation: a fixed share of the remaining
 * distance per unit of time, so a jump of any size glides in and lands softly, and growth that keeps coming
 * (a reply being written) is followed without steps. The last pixel is taken whole.
 */
export function followStep(gap: number, elapsedMs: number) {
  if (gap <= DONE_WITHIN) return gap;
  return Math.max(Math.min(gap, 1), gap * (1 - Math.exp(-elapsedMs / SETTLE_MS)));
}
