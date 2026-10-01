import { z } from "zod";

export const DiscoveredRepositorySchema = z.object({
  path: z.string(),
  name: z.string(),
  lastActivityAt: z.string(),
});

export const ProjectDiscoverRequestSchema = z.object({
  type: z.literal("project.discover.request"),
  requestId: z.string(),
  limit: z.number().int().min(1).max(20).optional(),
});

export const ProjectDiscoverResponseSchema = z.object({
  type: z.literal("project.discover.response"),
  payload: z.object({
    requestId: z.string(),
    repositories: z.array(DiscoveredRepositorySchema),
    error: z.string().nullable(),
  }),
});

export type DiscoveredRepository = z.infer<typeof DiscoveredRepositorySchema>;

export const ProjectDiscoveryInboundSchemas = [ProjectDiscoverRequestSchema] as const;

export const ProjectDiscoveryOutboundSchemas = [ProjectDiscoverResponseSchema] as const;
