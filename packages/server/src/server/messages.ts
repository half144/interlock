import type { AgentStreamEvent } from "./agent/agent-sdk-types.js";
import type { AgentStreamEventPayload } from "@interlock/protocol/messages";
import { AgentStreamEventPayloadSchema as AgentStreamEventPayloadRuntimeSchema } from "@interlock/protocol/messages";

export * from "@interlock/protocol/messages";

function validateStreamEventPayload(payload: unknown): AgentStreamEventPayload | null {
  const parsed = AgentStreamEventPayloadRuntimeSchema.safeParse(payload);
  if (!parsed.success) {
    return null;
  }
  return parsed.data;
}

export function serializeAgentStreamEvent(event: AgentStreamEvent): AgentStreamEventPayload | null {
  if (event.type === "attention_required") {
    // Providers may emit attention_required without per-client notification context.
    // The websocket server emits attention_required with shouldNotify computed per client.
    // Normalize provider events so they satisfy the shared schema.
    return validateStreamEventPayload({
      type: "attention_required",
      provider: event.provider,
      reason: event.reason,
      timestamp: event.timestamp,
      shouldNotify: false,
    });
  }

  return validateStreamEventPayload(event);
}
