import type { ToolChip } from "@/types";
import { plural } from "@/lib/utils";

interface Keyed {
  key: string;
  chip: ToolChip;
}

export type ToolGroup =
  | ({ type: "call" } & Keyed)
  | {
      type: "explore";
      key: string;
      calls: Keyed[];
      summary: string;
      running: boolean;
      failures: number;
    };

const times = (n: number) => {
  if (n === 1) return "once";
  return n === 2 ? "twice" : `${n} times`;
};

/** "Read 4 files, searched twice and checked git", like the subagent call groups. */
export function exploreSummary(chips: ToolChip[]): string {
  const files = new Set(chips.flatMap((chip) => chip.explored?.files ?? [])).size;
  const looks = chips.flatMap((chip) => chip.explored?.looks ?? []);
  const count = (look: string) => looks.filter((l) => l === look).length;
  const [searches, lists, git] = [count("search"), count("list"), count("git")];
  const parts = [
    files > 0 && `read ${plural(files, "file")}`,
    searches > 0 && `searched ${times(searches)}`,
    lists > 0 && `listed ${plural(lists, "folder")}`,
    git > 0 && "checked git",
  ].filter((part) => part !== false);
  const last = parts.pop();
  if (last === undefined) return "Explored the project";
  const text = parts.length > 0 ? `${parts.join(", ")} and ${last}` : last;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function explore(calls: Keyed[], key: string): ToolGroup {
  const chips = calls.map((call) => call.chip);
  return {
    type: "explore",
    key: `explore:${key}`,
    calls,
    summary: exploreSummary(chips),
    running: chips.some((chip) => chip.status === "running"),
    failures: chips.filter((chip) => chip.status === "failed").length,
  };
}

/**
 * Back-to-back calls that only looked around fold into one line, the way Claude Code and Cursor
 * show exploration; a lone one stays a call of its own.
 */
export function groupTools(chips: ToolChip[]): ToolGroup[] {
  const groups: ToolGroup[] = [];
  let run: Keyed[] = [];
  const flush = () => {
    const [first] = run;
    if (first && run.length > 1) groups.push(explore(run, first.key));
    else if (first) groups.push({ type: "call", key: `call:${first.key}`, chip: first.chip });
    run = [];
  };
  chips.forEach((chip, i) => {
    const key = chip.callId ?? String(i);
    if (chip.explored) {
      run.push({ chip, key });
      return;
    }
    flush();
    groups.push({ type: "call", key: `call:${key}`, chip });
  });
  flush();
  return groups;
}
