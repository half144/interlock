import * as daemon from "@/daemon/commands";
import { isImageFile } from "@/lib/attachments";
import type { Message } from "@/types";
import { patchAgent } from "./helpers";
import { holdActions } from "./holdActions";
import type { TaskSlice } from "./slices/tasks";
import { withMessage, withoutMessage } from "./threads";
import type { AppState } from "./types";

type Set = (update: (state: AppState) => Partial<AppState> | AppState) => void;
type Get = () => AppState;
type Actions = Pick<
  TaskSlice,
  | "resolveHold"
  | "resolveQuestions"
  | "resolvePlan"
  | "startTask"
  | "sendMessage"
  | "interrupt"
  | "startPlanning"
  | "setEffort"
  | "setModel"
  | "discard"
>;

/** The actions that call the daemon. A failure lands in `actionError` instead of being thrown at the view. */
export function taskActions(set: Set, get: Get): Actions {
  const attempt = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (error) {
      get().reportError(error);
    }
  };

  const send = async (threadId: string, text: string, files: File[]) => {
    const agent = get().agents[threadId];
    const thread = get().threads[threadId];
    if (!agent || !thread) return;
    const id = crypto.randomUUID();
    const attachments = files.map((file) => ({ name: file.name, isImage: isImageFile(file) }));
    const message: Message = {
      id,
      role: "user",
      text,
      at: Date.now(),
      ...(attachments.length > 0 ? { attachments } : {}),
    };
    set((s) => ({ threads: { ...s.threads, [threadId]: withMessage(thread, message) } }));
    try {
      await daemon.sendMessage(agent, text, id, files);
    } catch (error) {
      set((s) => {
        const current = s.threads[threadId];
        return current ? { threads: { ...s.threads, [threadId]: withoutMessage(current, id) } } : s;
      });
      throw error;
    }
  };

  const changeEffort = async (agentId: string, effort: string) => {
    const previous = get().agents[agentId]?.effort;
    set((s) => ({ agents: patchAgent(s.agents, agentId, { effort }) }));
    try {
      await daemon.setEffort(agentId, effort);
    } catch (error) {
      set((s) => ({ agents: patchAgent(s.agents, agentId, previous ? { effort: previous } : {}) }));
      throw error;
    }
  };

  return {
    ...holdActions(get, attempt),
    startTask: (task) =>
      attempt(async () => {
        const project = get().projects[task.projectId];
        if (!project) return;
        const { agentId } = await daemon.startTask({
          project,
          prompt: task.prompt,
          base: task.base,
          kind: task.kind,
          modelId: task.model,
          mode: task.mode,
          effort: task.effort,
          autonomy: project.settings.autonomy,
          files: task.files,
        });
        get().openThread(agentId);
      }),
    sendMessage: (threadId, text, files) => attempt(() => send(threadId, text, files)),
    interrupt: (agentId) => attempt(() => daemon.interrupt(agentId)),
    startPlanning: (agentId) =>
      attempt(async () => {
        const agent = get().agents[agentId];
        if (agent) await daemon.startPlanning(agent);
      }),
    setEffort: (agentId, effort) => attempt(() => changeEffort(agentId, effort)),
    setModel: (agentId, modelId) => attempt(() => daemon.setModel(agentId, modelId)),
    discard: (agentId) =>
      attempt(async () => {
        const agent = get().agents[agentId];
        if (!agent) return;
        await daemon.discard(agent.cwd);
        get().go({ kind: "yard" });
      }),
  };
}
