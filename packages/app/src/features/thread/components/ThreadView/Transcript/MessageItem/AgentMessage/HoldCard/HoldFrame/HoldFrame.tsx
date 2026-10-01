import type { ReactNode } from "react";
import { CircleHelp, ListChecks, ShieldCheck, TriangleAlert, type LucideIcon } from "lucide-react";
import type { HoldKind } from "@/types";
import { surface } from "@/lib/styles";
import { cn } from "@/lib/utils";

const kinds: Record<HoldKind, { label: string; icon: LucideIcon }> = {
  question: { label: "Needs your decision", icon: CircleHelp },
  approval: { label: "Needs your permission", icon: ShieldCheck },
  plan: { label: "Needs your approval", icon: ListChecks },
  conflict: { label: "Needs you", icon: TriangleAlert },
};

interface HoldFrameProps {
  kind: HoldKind;
  title: string;
  /** What the agent is asking, under the title. */
  summary?: string;
  /** The real thing being asked about: a command, a file, a plan, the questions. */
  children?: ReactNode;
  /** The ways to answer, bottom right. */
  actions: ReactNode;
}

export function HoldFrame({ kind, title, summary, children, actions }: HoldFrameProps) {
  const { label, icon: Icon } = kinds[kind];

  return (
    <div className={cn(surface.card, "p-5")}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-hold/10">
          <Icon className="size-4 text-hold" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12.5px] font-medium text-hold">{label}</p>
          <h3 className="mt-1 font-serif text-[17px] leading-snug font-bold break-words text-ink [text-wrap:balance]">
            {title}
          </h3>
          {summary && (
            <p className="mt-1.5 text-[14px] leading-[1.6] text-ink-2 [text-wrap:pretty]">
              {summary}
            </p>
          )}
          {children}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">{actions}</div>
    </div>
  );
}
