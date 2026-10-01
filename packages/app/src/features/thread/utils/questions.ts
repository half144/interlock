import type { HoldQuestion } from "@/types";

export type Picks = Record<number, readonly string[]>;
export type Typed = Record<number, string>;

export const asksForText = (question: HoldQuestion) =>
  question.options.length === 0 || question.allowOther === true;

function isAnswered(question: HoldQuestion, index: number, picks: Picks, typed: Typed): boolean {
  if ((picks[index] ?? []).length > 0) return true;
  if (!asksForText(question)) return false;
  return (typed[index] ?? "").trim().length > 0 || question.allowEmpty === true;
}

export const allAnswered = (questions: HoldQuestion[], picks: Picks, typed: Typed) =>
  questions.every((question, index) => isAnswered(question, index, picks, typed));

/** Picking an option of a single-choice question replaces the earlier pick; a multi-choice question toggles it. */
export function togglePick(question: HoldQuestion, current: readonly string[], label: string) {
  if (!question.multiSelect) return current[0] === label ? [] : [label];
  return current.includes(label) ? current.filter((l) => l !== label) : [...current, label];
}

/** The answers by question header. Typed text wins over picks, as in Paseo's question form. */
export function buildAnswers(
  questions: HoldQuestion[],
  picks: Picks,
  typed: Typed,
): Record<string, string> {
  const answers: Record<string, string> = {};
  questions.forEach((question, index) => {
    const text = (typed[index] ?? "").trim();
    const picked = picks[index] ?? [];
    if (asksForText(question) && text) answers[question.header] = text;
    else if (picked.length > 0) answers[question.header] = picked.join(", ");
    else if (question.allowEmpty === true) answers[question.header] = "";
  });
  return answers;
}
