import { useState } from "react";
import { useStore } from "@/stores/app-store";
import type { Hold } from "@/types";
import {
  allAnswered,
  buildAnswers,
  togglePick,
  type Picks,
  type Typed,
} from "@/features/thread/utils/questions";

export function useQuestionHold(agentId: string, hold: Hold) {
  const resolveQuestions = useStore((s) => s.resolveQuestions);
  const resolveHold = useStore((s) => s.resolveHold);
  const questions = hold.questions ?? [];
  const [picks, setPicks] = useState<Picks>({});
  const [typed, setTyped] = useState<Typed>({});

  return {
    questions,
    picks,
    typed,
    ready: allAnswered(questions, picks, typed),
    pick: (index: number, label: string) => {
      const question = questions[index];
      if (question)
        setPicks((p) => ({ ...p, [index]: togglePick(question, p[index] ?? [], label) }));
    },
    type: (index: number, text: string) => setTyped((t) => ({ ...t, [index]: text })),
    submit: () => void resolveQuestions(agentId, buildAnswers(questions, picks, typed)),
    dismiss: () => void resolveHold(agentId, "Deny"),
  };
}
