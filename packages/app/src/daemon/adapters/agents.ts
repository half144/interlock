import type { AgentSnapshotPayload } from "@interlock/protocol/messages";
import type { Agent, AgentKind, Aspect, Workspace } from "@/types";
import { deriveAspect } from "./aspect";
import { permissionToHold } from "./holds";
import { kindOf } from "./providers";

export interface AgentContext {
  workspace: Workspace | undefined;
  projectId: string | null;
  baseBranch: string;
  pr: { number: number | null; merged: boolean } | null;
  modelLabel: (kind: AgentKind, modelId: string | null) => string;
}

const STEPS: Record<Aspect, string> = {
  running: "Working",
  held: "Waiting for you",
  review: "Ready for review",
  failed: "Failed",
  queued: "Starting",
  idle: "Idle",
  merged: "Merged",
  discarded: "Discarded",
};

const tokensOf = (usage: AgentSnapshotPayload["lastUsage"]) =>
  usage?.contextWindowUsedTokens ?? (usage?.inputTokens ?? 0) + (usage?.outputTokens ?? 0);

function aspectOf(snapshot: AgentSnapshotPayload, ctx: AgentContext): Aspect {
  const workspace = ctx.workspace;
  return deriveAspect({
    status: snapshot.status,
    pendingPermissions: snapshot.pendingPermissions.length,
    archived: Boolean(snapshot.archivedAt),
    hasChanges: (workspace?.additions ?? 0) + (workspace?.deletions ?? 0) > 0,
    merged: ctx.pr?.merged === true,
  });
}

function timingOf(snapshot: AgentSnapshotPayload) {
  const startedAt = snapshot.activeTurn?.startedAt;
  return {
    createdAt: Date.parse(snapshot.createdAt),
    updatedAt: Date.parse(snapshot.updatedAt),
    turnStartedAt: startedAt ? Date.parse(startedAt) : null,
  };
}

function placementOf(snapshot: AgentSnapshotPayload, ctx: AgentContext) {
  return {
    workspaceId: snapshot.workspaceId ?? null,
    branch: ctx.workspace?.branch ?? "",
    additions: ctx.workspace?.additions ?? 0,
    deletions: ctx.workspace?.deletions ?? 0,
  };
}

function optionalFields(snapshot: AgentSnapshotPayload, ctx: AgentContext) {
  const effort = snapshot.thinkingOptionId ?? snapshot.effectiveThinkingOptionId;
  const pending = snapshot.pendingPermissions[0];
  return {
    hold: pending ? permissionToHold(pending) : undefined,
    ...(ctx.pr?.number == null ? {} : { pr: ctx.pr.number }),
    ...(effort ? { effort } : {}),
    ...(snapshot.lastError ? { error: snapshot.lastError } : {}),
  };
}

export function toAgent(snapshot: AgentSnapshotPayload, ctx: AgentContext): Agent | null {
  const kind = kindOf(snapshot.provider);
  if (!kind || ctx.projectId === null) return null;
  const aspect = aspectOf(snapshot, ctx);
  return {
    id: snapshot.id,
    headcode: snapshot.id.slice(0, 7),
    projectId: ctx.projectId,
    ...placementOf(snapshot, ctx),
    threadId: snapshot.id,
    cwd: snapshot.cwd,
    git: ctx.workspace?.git ?? true,
    title: snapshot.title ?? "Untitled task",
    base: ctx.baseBranch,
    kind,
    model: ctx.modelLabel(kind, snapshot.model),
    modelId: snapshot.model,
    aspect,
    step: aspect === "failed" ? (snapshot.lastError ?? STEPS.failed) : STEPS[aspect],
    ...timingOf(snapshot),
    tokens: tokensOf(snapshot.lastUsage),
    files: [],
    unseen: 0,
    mode: snapshot.currentModeId?.includes("plan") ? "plan" : "auto",
    modeId: snapshot.currentModeId,
    ...optionalFields(snapshot, ctx),
  };
}
