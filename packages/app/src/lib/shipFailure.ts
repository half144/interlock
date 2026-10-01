import type { ForgeAccess, ShipError } from "@/types";

export interface ShipFailureNote {
  title: string;
  /** What to do about it. */
  hint: string;
  /** A command to run in a terminal, when there is one. */
  command: string | null;
}

const NOTES = {
  no_remote: {
    title: "No GitHub remote",
    hint: "Pull requests are opened on GitHub, so origin has to point at a GitHub repository. Fix that, then try again.",
    command: null,
  },
  gh_missing: {
    title: "The GitHub CLI is not installed",
    hint: "Install gh, sign in with it, then try again.",
    command: "brew install gh && gh auth login",
  },
  gh_unauthenticated: {
    title: "The GitHub CLI is not signed in",
    hint: "Run this in a terminal, then try again.",
    command: "gh auth login",
  },
  push_rejected: {
    title: "GitHub rejected the push",
    hint: "The remote branch has commits this one lacks. Update the branch from the base branch, then try again.",
    command: null,
  },
} satisfies Record<string, ShipFailureNote>;

/** Turns what the daemon refused with into what the user can do next. The daemon's own words follow in `detail`. */
export function shipFailureNote(error: ShipError): ShipFailureNote & { detail: string } {
  const note: ShipFailureNote =
    error.code in NOTES
      ? NOTES[error.code as keyof typeof NOTES]
      : {
          title:
            error.code === "commit_failed"
              ? "The changes could not be committed"
              : "The pull request could not be created",
          hint: "Check the details below, then try again.",
          command: null,
        };
  return { ...note, detail: error.message };
}

/** What is in the way before anything is tried, when the daemon already knows. */
export function accessNote(access: ForgeAccess): ShipFailureNote | null {
  return access === "ready" ? null : NOTES[access];
}
