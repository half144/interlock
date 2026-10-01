import { Check } from "lucide-react";
import type { HoldQuestion } from "@/types";
import { Input } from "@/components/ui/Input/Input";
import { asksForText } from "@/features/thread/utils/questions";
import { cn } from "@/lib/utils";

interface QuestionFieldProps {
  question: HoldQuestion;
  /** Several questions share the form, so each shows its own; a lone one is already the card's title. */
  titled: boolean;
  picked: readonly string[];
  typed: string;
  onPick: (label: string) => void;
  onType: (text: string) => void;
}

export function QuestionField({
  question,
  titled,
  picked,
  typed,
  onPick,
  onType,
}: QuestionFieldProps) {
  return (
    <fieldset className="mt-4 min-w-0 first:mt-3">
      <legend className={cn("mb-1.5 text-[13.5px] font-medium text-ink", !titled && "sr-only")}>
        {question.question}
      </legend>
      {question.options.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {question.options.map((option) => {
            const on = picked.includes(option.label);
            return (
              <button
                key={option.label}
                type="button"
                role={question.multiSelect ? "checkbox" : "radio"}
                aria-checked={on}
                onClick={() => onPick(option.label)}
                className={cn(
                  "flex items-start gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors duration-150",
                  on ? "border-seam-2 bg-selected" : "border-seam hover:bg-hover",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 flex size-4 shrink-0 items-center justify-center border border-seam-2",
                    question.multiSelect ? "rounded-[4px]" : "rounded-full",
                    on && "bg-ink text-ground",
                  )}
                >
                  {on && <Check className="size-3" strokeWidth={3} />}
                </span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] text-ink">{option.label}</span>
                  {option.description && (
                    <span className="block text-[12.5px] text-ink-3">{option.description}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {asksForText(question) && (
        <Input
          value={typed}
          onChange={(e) => onType(e.target.value)}
          placeholder={
            question.placeholder ??
            (question.options.length > 0 ? "Something else…" : "Your answer")
          }
          aria-label={question.question}
          className={cn("w-full", question.options.length > 0 && "mt-1.5")}
        />
      )}
    </fieldset>
  );
}
