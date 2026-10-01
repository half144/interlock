import type { DiffLine } from "@/types";
import { cn } from "@/lib/utils";
import { keyed } from "@/features/thread/utils/blocks";

const tone = { add: "bg-add/10 text-add", del: "bg-del/10 text-del", ctx: "text-ink-3" };
const sign = { add: "+", del: "−", ctx: " " };

export function DiffLines({ lines }: { lines: DiffLine[] }) {
  return (
    <div className="w-max min-w-full">
      {keyed(lines).map(({ item, key }) => (
        <p key={key} className={cn("flex px-3.5 whitespace-pre", tone[item.kind])}>
          <span className="w-4 shrink-0 select-none">{sign[item.kind]}</span>
          {item.text || " "}
        </p>
      ))}
    </div>
  );
}
