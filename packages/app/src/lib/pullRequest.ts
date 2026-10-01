import type {
  Agent,
  Check,
  Checkout,
  ForgeAccess,
  PullRequestRef,
  PullRequestStatus,
  ShippedPullRequest,
} from "@/types";
import { summarizeChecks, type ChecksSummary } from "./checks";

type PullRequestPhase = "none" | "open" | "merged";

export interface PullRequestView {
  phase: PullRequestPhase;
  number: number | null;
  url: string | null;
  title: string | null;
  draft: boolean;
  conflicting: boolean;
  checks: Check[];
  summary: ChecksSummary;
  access: ForgeAccess;
}

interface Sources {
  agent: Pick<Agent, "aspect">;
  /** The live status the daemon polls from `gh`. */
  checkout: Checkout | undefined;
  /** What the app opened, or saw merged, before the next poll. */
  shipped: ShippedPullRequest | undefined;
  /** The pull request the workspace list carries. */
  workspacePr: PullRequestRef | undefined;
}

const isMerged = ({ agent, checkout, shipped, workspacePr }: Sources) =>
  agent.aspect === "merged" ||
  [checkout?.pr?.merged, shipped?.merged, workspacePr?.merged].some(Boolean);

function phaseOf(merged: boolean, known: boolean): PullRequestPhase {
  if (merged) return "merged";
  return known ? "open" : "none";
}

const numberOf = ({ checkout, shipped, workspacePr }: Sources) =>
  checkout?.pr?.number ?? shipped?.number ?? workspacePr?.number ?? null;

const urlOf = ({ checkout, shipped }: Sources) => checkout?.pr?.url ?? shipped?.url ?? null;

const detailsOf = (live: PullRequestStatus | null | undefined) => ({
  title: live?.title ?? null,
  draft: live?.draft ?? false,
  conflicting: live?.conflicting ?? false,
  checks: live?.checks ?? [],
});

/** One answer from the three places a pull request shows up: the poll, the push, and the workspace list. */
export function pullRequestOf(sources: Sources): PullRequestView {
  const number = numberOf(sources);
  const url = urlOf(sources);
  const details = detailsOf(sources.checkout?.pr);
  return {
    number,
    url,
    ...details,
    phase: phaseOf(isMerged(sources), number !== null || url !== null),
    summary: summarizeChecks(details.checks),
    access: sources.checkout?.access ?? "ready",
  };
}
