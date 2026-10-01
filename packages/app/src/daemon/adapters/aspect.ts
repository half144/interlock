import type { Aspect } from "@/types";

interface AspectInput {
  status: "initializing" | "idle" | "running" | "error" | "closed";
  pendingPermissions: number;
  archived: boolean;
  hasChanges: boolean;
  merged: boolean;
}

export function deriveAspect(input: AspectInput): Aspect {
  if (input.merged) return "merged";
  if (input.archived) return "discarded";
  if (input.pendingPermissions > 0) return "held";
  switch (input.status) {
    case "error":
      return "failed";
    case "running":
      return "running";
    case "initializing":
      return "queued";
    case "idle":
      return input.hasChanges ? "review" : "idle";
    case "closed":
      return "idle";
  }
}
