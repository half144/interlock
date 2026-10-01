import type { Agent, LogLine } from "@/types";
import { projectById } from "@/mocks/projects";

export type Pane = "setup" | "agent" | "server";

export const PANES: [Pane, string][] = [
  ["setup", "setup"],
  ["agent", "agent"],
  ["server", "dev server"],
];

export function serverLog(agent: Agent): LogLine[] {
  const project = projectById[agent.projectId];
  if (!project) return [];
  return [
    { kind: "cmd", text: project.runScript.replace("$PORT", String(project.port)) },
    { kind: "out", text: `${project.stack} · worktree ${agent.headcode}` },
    { kind: "out", text: `- Local:   http://localhost:${project.port}` },
    { kind: "ok", text: "✓ Ready in 1.8s" },
    { kind: "dim", text: `GET / 200 in 84ms` },
    { kind: "dim", text: `GET /checkout 200 in 112ms` },
  ];
}

/** What the sandbox answers to a command typed into the worktree's terminal. */
export function reply(input: string, agent: Agent): LogLine[] {
  const cmd = input.trim();
  if (cmd === "git status")
    return [
      { kind: "out", text: `On branch ${agent.branch}` },
      { kind: "out", text: `Changes not staged for commit: ${agent.files.length} files` },
    ];
  if (cmd.startsWith("git log"))
    return [{ kind: "out", text: `a91f3c2 (HEAD -> ${agent.branch}) ${agent.title}` }];
  if (cmd === "ls")
    return [{ kind: "out", text: "README.md  package.json  pnpm-lock.yaml  src  tsconfig.json" }];
  if (cmd.startsWith("pnpm test") || cmd.startsWith("pnpm vitest"))
    return [{ kind: "ok", text: ` ✓ ${Math.max(agent.checks.passed, 3)} tests passed` }];
  if (cmd === "clear") return [];
  return [{ kind: "dim", text: `ran in the ${agent.headcode} sandbox · exit 0` }];
}
