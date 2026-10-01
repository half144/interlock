import type { Skill } from "@/types";
import { toSkills } from "./adapters/skills";
import { getClient } from "./client";

export async function listAgentSkills(agentId: string): Promise<Skill[]> {
  return toSkills(await getClient().listCommands({ agentId }));
}
