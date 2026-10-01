import type { AgentKind, Skill } from "@/types";
import { toSkills } from "./adapters/skills";
import { getClient } from "./client";

export async function listAgentSkills(agentId: string): Promise<Skill[]> {
  return toSkills(await getClient().listCommands({ agentId }));
}

/** Skills a task would have before it exists: the provider's list for a folder and model. */
export async function listDraftSkills(
  kind: AgentKind,
  cwd: string,
  model: string,
): Promise<Skill[]> {
  const draftConfig = { provider: kind, cwd, model };
  return toSkills(await getClient().listCommands({ agentId: "", draftConfig }));
}
