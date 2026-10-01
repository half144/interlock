import type { Hold } from "@/types";
import { Button } from "@/components/ui/Button/Button";
import { HoldFrame } from "../HoldFrame/HoldFrame";
import { QuestionField } from "./QuestionField/QuestionField";
import { useQuestionHold } from "./useQuestionHold";

export function QuestionHold({ agentId, hold }: { agentId: string; hold: Hold }) {
  const { questions, picks, typed, ready, pick, type, submit, dismiss } = useQuestionHold(
    agentId,
    hold,
  );

  return (
    <HoldFrame
      kind="question"
      title={questions.length > 1 ? "A few questions for you" : hold.title}
      actions={
        <>
          <Button variant="danger" className="mr-auto" onClick={dismiss}>
            Dismiss
          </Button>
          <Button variant="primary" disabled={!ready} onClick={submit}>
            {questions.length > 1 ? "Send answers" : "Send answer"}
          </Button>
        </>
      }
    >
      {questions.map((question, index) => (
        <QuestionField
          key={question.header || question.question}
          question={question}
          titled={questions.length > 1}
          picked={picks[index] ?? []}
          typed={typed[index] ?? ""}
          onPick={(label) => pick(index, label)}
          onType={(text) => type(index, text)}
        />
      ))}
    </HoldFrame>
  );
}
