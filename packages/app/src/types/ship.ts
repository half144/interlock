export type CheckState = "pending" | "success" | "failure" | "cancelled" | "skipped";

export interface Check {
  /** Unique within its pull request, so a list can key on it. */
  id: string;
  name: string;
  state: CheckState;
  /** How long it took, or has been running, as the daemon formats it ("2m 4s"). */
  duration: string | null;
  url: string | null;
  workflow: string | null;
}

export interface PullRequestStatus {
  number: number | null;
  url: string;
  title: string;
  merged: boolean;
  draft: boolean;
  /** The PR cannot be merged as it stands. */
  conflicting: boolean;
  checks: Check[];
}

/** Whether the daemon can reach the forge for this worktree, and if not, the one thing in the way. */
export type ForgeAccess = "ready" | "no_remote" | "gh_missing" | "gh_unauthenticated";

/** What the daemon knows about a worktree's pull request, by worktree directory. */
export interface Checkout {
  pr: PullRequestStatus | null;
  access: ForgeAccess;
}

type ShipErrorCode =
  | "no_remote"
  | "gh_missing"
  | "gh_unauthenticated"
  | "push_rejected"
  | "commit_failed"
  | "unknown";

export interface ShipError {
  code: ShipErrorCode;
  message: string;
}

/** A pull request the app opened or saw merged, by worktree directory. */
export interface ShippedPullRequest {
  number: number | null;
  url: string;
  merged: boolean;
}

type SetupState = "running" | "completed" | "failed" | "blocked";

/** What the worktree setup has printed so far and how it ended. */
export interface SetupRun {
  state: SetupState;
  log: string;
  error: string | null;
}
