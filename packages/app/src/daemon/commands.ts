import type { Agent, AgentKind, Autonomy, Effort, Hold, Project } from "@/types";
import { checkedOutBranch, startingBranches } from "./branches";
import { savedBaseBranch } from "./branchPreference";
import { loadProjectSettings } from "./projectSettings";
import { getClient } from "./client";
import { toPromptAttachments, withPromptAttachments } from "./attachments";
import {
  answersResponse,
  hasResumeAction,
  holdResponse,
  planResponse,
  type PlanChoice,
} from "./adapters/holds";
import { featuresFor, modeFor } from "./adapters/modes";
import { addProjectFailure, toProject } from "./adapters/projects";

export interface StartTaskInput {
  project: Project;
  prompt: string;
  base: string;
  kind: AgentKind;
  modelId: string;
  mode: "plan" | "auto";
  effort: Effort | null;
  autonomy: Autonomy;
  files: File[];
}

export async function addProject(path: string): Promise<Project> {
  const client = getClient();
  const result = await client.addProject(path);
  if (result.error || !result.project) throw new Error(addProjectFailure(result));
  const defaultBranch =
    savedBaseBranch(result.project.projectRootPath) ??
    result.git?.defaultBranch ??
    (await checkedOutBranch(client, result.project.projectRootPath));
  const project = toProject(result.project, {
    remoteUrl: result.git?.remoteUrl ?? null,
    ...(defaultBranch ? { defaultBranch } : {}),
  });
  return { ...project, settings: (await loadProjectSettings(project.id)).settings };
}

/** A task is a worktree cut from the base branch plus an agent running in it; the daemon names both from the prompt. */
export async function startTask(input: StartTaskInput): Promise<{ agentId: string }> {
  const client = getClient();
  const modeId = modeFor(input.kind, input.mode, input.autonomy);
  const features = featuresFor(input.kind, input.mode);
  const agent = await client.createAgent({
    provider: input.kind,
    cwd: input.project.rootPath,
    worktree: { mode: "branch-off", base: input.base },
    model: input.modelId,
    initialPrompt: input.prompt,
    clientMessageId: crypto.randomUUID(),
    ...(modeId ? { modeId } : {}),
    ...(features ? { featureValues: features } : {}),
    ...(input.effort ? { thinkingOptionId: input.effort } : {}),
    ...withPromptAttachments(await toPromptAttachments(client, input.files)),
  });
  return { agentId: agent.id };
}

export const searchBranches = (cwd: string, query: string): Promise<string[]> =>
  startingBranches(getClient(), cwd, query);

/** While the agent is running the message steers the current turn instead of waiting for it to end. */
export async function sendMessage(
  agent: Agent,
  text: string,
  messageId: string,
  files: File[],
): Promise<void> {
  const client = getClient();
  await client.sendAgentMessage(agent.id, text, {
    messageId,
    ...(agent.aspect === "running" ? { activeTurnBehavior: "steer" as const } : {}),
    ...withPromptAttachments(await toPromptAttachments(client, files)),
  });
}

export const interrupt = (agentId: string): Promise<void> => getClient().cancelAgent(agentId);

export function answerHold(agentId: string, hold: Hold, option: string): Promise<void> {
  return getClient().respondToPermission(agentId, hold.requestId, holdResponse(hold, option));
}

export function answerQuestions(
  agentId: string,
  hold: Hold,
  answers: Record<string, string>,
): Promise<void> {
  return getClient().respondToPermission(agentId, hold.requestId, answersResponse(hold, answers));
}

/** Approving a plan that did not start from full auto and asking for full auto switches the mode once the plan is approved. */
export async function answerPlan(agent: Agent, hold: Hold, choice: PlanChoice): Promise<void> {
  const client = getClient();
  await client.respondToPermission(agent.id, hold.requestId, planResponse(hold, choice));
  const fullAuto = modeFor(agent.kind, "auto", "full-auto");
  if (choice === "full-auto" && fullAuto && !hasResumeAction(hold)) {
    await client.setAgentMode(agent.id, fullAuto);
  }
}

/** The next turns of the conversation plan first: Claude switches to its plan mode, Codex turns its plan collaboration mode on. */
export async function startPlanning(agent: Agent): Promise<void> {
  const client = getClient();
  if (agent.kind === "codex") await client.setAgentFeature(agent.id, "plan_mode", true);
  else await client.setAgentMode(agent.id, "plan");
}

export async function setEffort(agentId: string, effort: Effort): Promise<void> {
  await getClient().setAgentThinkingOption(agentId, effort);
}

export const setModel = (agentId: string, modelId: string): Promise<void> =>
  getClient().setAgentModel(agentId, modelId);

/** Stops the agent and removes its worktree and local branch. */
export async function discard(cwd: string): Promise<void> {
  const result = await getClient().discardTask(cwd);
  if (!result.success) {
    throw new Error(result.error?.message ?? "The daemon could not discard the task.");
  }
}
