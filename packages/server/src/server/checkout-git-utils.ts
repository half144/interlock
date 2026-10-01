import {
  MergeConflictError,
  MergeFromBaseConflictError,
  NotGitRepoError,
} from "../utils/checkout-git.js";

export const READ_ONLY_GIT_ENV = {
  GIT_OPTIONAL_LOCKS: "0",
} as const;

type CheckoutErrorCode = "NOT_GIT_REPO" | "NOT_ALLOWED" | "MERGE_CONFLICT" | "UNKNOWN";

export interface CheckoutErrorPayload {
  code: CheckoutErrorCode;
  message: string;
}

export function toCheckoutError(error: unknown): CheckoutErrorPayload {
  if (error instanceof NotGitRepoError) {
    return { code: "NOT_GIT_REPO", message: error.message };
  }
  if (error instanceof MergeConflictError) {
    return { code: "MERGE_CONFLICT", message: error.message };
  }
  if (error instanceof MergeFromBaseConflictError) {
    return { code: "MERGE_CONFLICT", message: error.message };
  }
  if (error instanceof Error) {
    return { code: "UNKNOWN", message: error.message };
  }
  return { code: "UNKNOWN", message: String(error) };
}
