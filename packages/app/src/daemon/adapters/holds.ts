import type {
  AgentPermissionRequest,
  AgentPermissionResponse,
  ToolCallDetail,
} from "@interlock/protocol/agent-types";
import type { Hold, HoldQuestion } from "@/types";

const DENY = "Deny";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const text = (value: unknown) => (typeof value === "string" ? value : "");

export type PlanChoice = "approve" | "reject" | "full-auto";

function parseQuestions(input: Record<string, unknown> | undefined): HoldQuestion[] {
  const raw = input?.["questions"];
  if (!Array.isArray(raw)) return [];
  return raw.filter(isRecord).map((q) => {
    const options = Array.isArray(q["options"]) ? q["options"].filter(isRecord) : [];
    const placeholder = text(q["placeholder"]);
    return {
      header: text(q["header"]),
      question: text(q["question"]),
      options: options.map((o) => {
        const description = text(o["description"]);
        return { label: text(o["label"]), ...(description ? { description } : {}) };
      }),
      multiSelect: q["multiSelect"] === true,
      ...(q["allowOther"] === true || q["isOther"] === true ? { allowOther: true } : {}),
      ...(q["allowEmpty"] === true ? { allowEmpty: true } : {}),
      ...(placeholder ? { placeholder } : {}),
    };
  });
}

function approvalOf(request: AgentPermissionRequest): Pick<Hold, "title" | "command" | "file"> {
  const detail: ToolCallDetail | undefined = request.detail;
  if (detail?.type === "shell") return { title: "Run a command", command: detail.command };
  if (detail?.type === "read") return { title: `Read ${detail.filePath}`, file: detail.filePath };
  if (detail?.type === "edit") return { title: `Edit ${detail.filePath}`, file: detail.filePath };
  if (detail?.type === "write") return { title: `Write ${detail.filePath}`, file: detail.filePath };
  return { title: request.title ?? request.name };
}

const actionsOf = (request: AgentPermissionRequest): NonNullable<Hold["actions"]> =>
  (request.actions ?? []).map(({ id, label, behavior }) => ({ id, label, behavior }));

type HoldBase = Pick<Hold, "requestId" | "detail" | "actions" | "input">;

const allowLabels = (actions: NonNullable<Hold["actions"]>) =>
  actions.filter((a) => a.behavior === "allow").map((a) => a.label);

function questionHold(request: AgentPermissionRequest, base: HoldBase): Hold {
  const questions = parseQuestions(request.input);
  const first = questions[0];
  return {
    ...base,
    kind: "question",
    title: first?.question ?? request.title ?? "A question for you",
    questions,
    options: [...(first?.options.map((o) => o.label) ?? []), DENY],
  };
}

function planHold(request: AgentPermissionRequest, base: HoldBase): Hold {
  const plan = text(request.input?.["plan"]);
  return {
    ...base,
    kind: "plan",
    title: "Approve the plan?",
    detail: request.description ?? "Review the proposed plan before implementation starts.",
    ...(plan ? { plan } : {}),
    options: [...allowLabels(base.actions ?? []), DENY],
  };
}

function approvalHold(request: AgentPermissionRequest, base: HoldBase): Hold {
  const labels = allowLabels(base.actions ?? []);
  return {
    ...base,
    ...approvalOf(request),
    kind: "approval",
    detail: request.description ?? "The agent needs your permission to continue.",
    options: [...(labels.length > 0 ? labels : ["Allow"]), DENY],
  };
}

export function permissionToHold(request: AgentPermissionRequest): Hold {
  const base: HoldBase = {
    requestId: request.id,
    detail: request.description ?? "",
    ...(request.input ? { input: request.input } : {}),
    actions: actionsOf(request),
  };
  if (request.kind === "question") return questionHold(request, base);
  if (request.kind === "plan") return planHold(request, base);
  return approvalHold(request, base);
}

/** The answers of a question hold, by question header. */
export function answersResponse(
  hold: Hold,
  answers: Record<string, string>,
): AgentPermissionResponse {
  return { behavior: "allow", updatedInput: { ...hold.input, answers } };
}

export function holdResponse(hold: Hold, option: string): AgentPermissionResponse {
  if (option === DENY) {
    return {
      behavior: "deny",
      message: hold.kind === "question" ? "Dismissed by user" : "Denied by user",
    };
  }
  if (hold.kind === "question") {
    const header = hold.questions?.[0]?.header ?? "";
    return answersResponse(hold, { [header]: option });
  }
  const action = hold.actions?.find((a) => a.label === option);
  if (!action) return { behavior: "allow" };
  return action.behavior === "deny"
    ? { behavior: "deny", selectedActionId: action.id }
    : { behavior: "allow", selectedActionId: action.id };
}

/** Whether the daemon offers to approve and switch to full access in one step (a plan started from full auto). */
export const hasResumeAction = (hold: Hold) =>
  hold.actions?.some((a) => a.id === "implement_resume") === true;

export function planResponse(hold: Hold, choice: PlanChoice): AgentPermissionResponse {
  const actions = hold.actions ?? [];
  if (choice === "reject") {
    const reject = actions.find((a) => a.behavior === "deny");
    return reject
      ? { behavior: "deny", selectedActionId: reject.id }
      : { behavior: "deny", message: "Rejected by user" };
  }
  const resume = choice === "full-auto" ? actions.find((a) => a.id === "implement_resume") : null;
  const approve =
    resume ?? actions.find((a) => a.behavior === "allow" && a.id !== "implement_resume");
  return approve ? { behavior: "allow", selectedActionId: approve.id } : { behavior: "allow" };
}
