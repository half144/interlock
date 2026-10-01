import { z } from "zod";

export const TaskPlanItemSchema = z.object({
  text: z.string(),
  status: z.enum(["pending", "in_progress", "completed"]),
});

export const TaskShipErrorSchema = z.object({
  code: z.enum([
    "no_remote",
    "gh_missing",
    "gh_unauthenticated",
    "push_rejected",
    "commit_failed",
    "unknown",
  ]),
  message: z.string(),
});

export const TaskCreatePrRequestSchema = z.object({
  type: z.literal("task_create_pr_request"),
  cwd: z.string(),
  title: z.string().min(1),
  planItems: z.array(TaskPlanItemSchema).optional(),
  baseRef: z.string().optional(),
  requestId: z.string(),
});

export const TaskCreatePrResponseSchema = z.object({
  type: z.literal("task_create_pr_response"),
  payload: z.object({
    cwd: z.string(),
    number: z.number().nullable(),
    url: z.string().nullable(),
    committed: z.boolean(),
    error: TaskShipErrorSchema.nullable(),
    requestId: z.string(),
  }),
});

export const TaskDiscardRequestSchema = z.object({
  type: z.literal("task_discard_request"),
  cwd: z.string(),
  requestId: z.string(),
});

export const TaskDiscardResponseSchema = z.object({
  type: z.literal("task_discard_response"),
  payload: z.object({
    cwd: z.string(),
    success: z.boolean(),
    branchDeleted: z.boolean(),
    error: TaskShipErrorSchema.nullable(),
    requestId: z.string(),
  }),
});

export const TaskShipUpdateMessageSchema = z.object({
  type: z.literal("task_ship_update"),
  payload: z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("pr_created"),
      cwd: z.string(),
      number: z.number(),
      url: z.string(),
    }),
    z.object({
      kind: z.literal("merged"),
      cwd: z.string(),
      url: z.string(),
      archived: z.boolean(),
    }),
  ]),
});

export type TaskPlanItem = z.infer<typeof TaskPlanItemSchema>;
export type TaskShipError = z.infer<typeof TaskShipErrorSchema>;
export type TaskCreatePrResponse = z.infer<typeof TaskCreatePrResponseSchema>;
export type TaskDiscardResponse = z.infer<typeof TaskDiscardResponseSchema>;
export type TaskShipUpdateMessage = z.infer<typeof TaskShipUpdateMessageSchema>;
