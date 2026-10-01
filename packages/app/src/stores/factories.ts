import { projectById } from "@/mocks/projects";
import type { Agent, Thread } from "@/types";
import { nextMessageId } from "./helpers";
import type { NewTask } from "./types";

/** The next free id in a project, as in CHK-42 after CHK-41. */
export const nextAgentId = (projectId: string, agents: Record<string, Agent>) => {
  const used = Object.values(agents)
    .filter((a) => a.projectId === projectId)
    .map((a) => Number(a.headcode.split("-")[1] ?? 0));
  return `${projectById[projectId]?.key ?? projectId.toUpperCase()}-${Math.max(0, ...used) + 1}`;
};

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 28);

export function newAgent(id: string, threadId: string, title: string, task: NewTask): Agent {
  return {
    id,
    headcode: id,
    projectId: task.projectId,
    threadId,
    title,
    branch: `agent/${id.toLowerCase()}-${slug(title)}`,
    base: task.base,
    kind: task.kind,
    model: task.model,
    aspect: "running",
    progress: 0.02,
    step: "Setting up the worktree",
    startedMin: 0,
    tokens: 0,
    cost: 0,
    additions: 0,
    deletions: 0,
    files: [],
    checks: { passed: 0, failed: 0, pending: 0 },
    unseen: 0,
    mode: task.mode,
    effort: task.effort,
  };
}

export function newThread(id: string, agentId: string, title: string, task: NewTask): Thread {
  return {
    id,
    projectId: task.projectId,
    title,
    updatedMin: 0,
    agentIds: [agentId],
    messages: [
      { id: nextMessageId(), role: "user", minAgo: 0, text: task.prompt },
      {
        id: nextMessageId(),
        role: "agent",
        agentId,
        minAgo: 0,
        blocks: [
          {
            type: "text",
            text: `On it. I’m working in a fresh worktree from \`${task.base}\` and will check in if I need you.`,
          },
          {
            type: "step",
            text: "Set up the worktree and read the code",
            activeForm: "Setting up the worktree",
            status: "in_progress",
            tools: [{ tool: "bash", label: "Running the setup script" }],
          },
          task.mode === "plan"
            ? {
                type: "step",
                text: "Write a plan for your approval",
                activeForm: "Writing the plan",
                status: "pending",
              }
            : {
                type: "step",
                text: "Make the change",
                activeForm: "Making the change",
                status: "pending",
              },
          {
            type: "step",
            text: "Run the tests",
            activeForm: "Running the tests",
            status: "pending",
          },
        ],
      },
    ],
  };
}
