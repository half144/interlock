interface EffortCopy {
  blurb: string;
  pace: string;
}

const copy: Record<string, EffortCopy> = {
  minimal: { blurb: "Barely thinks. For trivial edits.", pace: "Fastest · fewest tokens" },
  low: { blurb: "Answers fast. Good for small, obvious edits.", pace: "Fastest · fewest tokens" },
  medium: { blurb: "Thinks before it acts. Right for most tasks.", pace: "Balanced" },
  high: {
    blurb: "Plans across files and checks its work before editing.",
    pace: "Slower · more tokens",
  },
  xhigh: {
    blurb: "Digs deeper than High before it acts, for work that spans many files.",
    pace: "Slower · many more tokens",
  },
  max: {
    blurb: "Its deepest reasoning, for hard bugs and large refactors.",
    pace: "Slowest · most tokens",
  },
};

/** What an effort level means, for the menu's footer. A level the app has no copy for shows none. */
export const effortCopy = (id: string): EffortCopy => copy[id] ?? { blurb: "", pace: "" };
