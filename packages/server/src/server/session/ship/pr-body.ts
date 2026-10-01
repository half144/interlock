import type { CheckoutCommit, TaskPlanItem } from "@interlock/protocol/messages";

const MAX_LISTED_FILES = 40;
const MAX_LISTED_COMMITS = 20;

const PLAN_MARKERS: Record<TaskPlanItem["status"], string> = {
  completed: "[x]",
  in_progress: "[ ]",
  pending: "[ ]",
};

export function buildTaskPrBody(input: {
  title: string;
  planItems: readonly TaskPlanItem[];
  commits: readonly CheckoutCommit[];
}): string {
  const sections = [`## ${input.title}`];

  if (input.planItems.length > 0) {
    const lines = input.planItems.map((item) => {
      const suffix = item.status === "in_progress" ? " (in progress)" : "";
      return `- ${PLAN_MARKERS[item.status]} ${item.text}${suffix}`;
    });
    sections.push(["### Plan", ...lines].join("\n"));
  }

  const taskCommits = input.commits.filter((commit) => !commit.isOnBase);
  if (taskCommits.length > 0) {
    sections.push(["### What changed", ...describeChanges(taskCommits)].join("\n"));
  }

  sections.push("---\nCreated with Interlock");
  return sections.join("\n\n");
}

function describeChanges(commits: readonly CheckoutCommit[]): string[] {
  const files = new Map<string, { additions: number; deletions: number }>();
  for (const commit of commits) {
    for (const file of commit.files) {
      const total = files.get(file.path) ?? { additions: 0, deletions: 0 };
      files.set(file.path, {
        additions: total.additions + file.additions,
        deletions: total.deletions + file.deletions,
      });
    }
  }

  const lines = [
    `${files.size} file${files.size === 1 ? "" : "s"} across ${commits.length} commit${commits.length === 1 ? "" : "s"}.`,
    "",
  ];
  lines.push(
    ...commits.slice(0, MAX_LISTED_COMMITS).map((c) => `- ${c.subject} (\`${c.shortSha}\`)`),
  );
  if (commits.length > MAX_LISTED_COMMITS) {
    lines.push(`- and ${commits.length - MAX_LISTED_COMMITS} more commits`);
  }
  lines.push("");
  const listed = [...files.entries()].slice(0, MAX_LISTED_FILES);
  lines.push(...listed.map(([path, c]) => `- \`${path}\` +${c.additions} -${c.deletions}`));
  if (files.size > MAX_LISTED_FILES) {
    lines.push(`- and ${files.size - MAX_LISTED_FILES} more files`);
  }
  return lines;
}
