const PROGRESSIVE: Record<string, string> = {
  Ran: "Running",
  Read: "Reading",
  Searched: "Searching",
  Listed: "Listing",
  Found: "Finding",
  Edited: "Editing",
  Wrote: "Writing",
  Checked: "Checking",
  Looked: "Looking",
  Fetched: "Fetching",
  Installed: "Installing",
  Built: "Building",
  Created: "Creating",
  Deleted: "Deleting",
  Moved: "Moving",
  Copied: "Copying",
  Compared: "Comparing",
  Committed: "Committing",
  Staged: "Staging",
  Pushed: "Pushing",
  Pulled: "Pulling",
  Switched: "Switching",
  Restored: "Restoring",
  Stashed: "Stashing",
  Explored: "Exploring",
  Set: "Setting",
  Added: "Adding",
  Asked: "Asking",
  Proposed: "Proposing",
  Stopped: "Stopping",
  Used: "Using",
};

const lowerFirst = (word: string) => word.charAt(0).toLowerCase() + word.slice(1);

const LOWER = new Map(
  Object.entries(PROGRESSIVE).map(([past, now]) => [lowerFirst(past), lowerFirst(now)]),
);
const UPPER = new Map(Object.entries(PROGRESSIVE));

/**
 * "Edited package.json and ran tests" while it happens: "Editing package.json and running tests".
 * Only verbs that open a phrase change, so a file named `Read` stays as it is.
 */
export const progressive = (text: string) =>
  text.replace(/(^|, | and )(\w+)(?= |$)/g, (match, lead: string, word: string) => {
    const now = UPPER.get(word) ?? LOWER.get(word);
    return now === undefined ? match : `${lead}${now}`;
  });
