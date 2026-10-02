/** How far below the scroller's top a section's heading must rise before it counts as the one you're reading. */
const READ_LINE = 120;

/** The last section whose heading passed the read line; at the very end of the page, the last section, which can never reach it. */
export function activeSection(offsets: Record<string, number>, ids: string[], atEnd: boolean) {
  if (atEnd) return ids[ids.length - 1] ?? "";
  const passed = ids.filter((id) => (offsets[id] ?? Infinity) < READ_LINE);
  return passed[passed.length - 1] ?? ids[0] ?? "";
}
