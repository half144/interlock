import { ArrowRight, MessageSquare } from "lucide-react";
import { focusComposer } from "@/features/thread/utils/focusComposer";

export function Followups({ items }: { items: string[] }) {
  return (
    <div>
      <p className="mb-1 text-[13px] text-ink-3">Suggested follow-ups</p>
      <ul className="divide-y divide-seam">
        {items.map((item) => (
          <li key={item}>
            <button
              type="button"
              onClick={() => focusComposer(item)}
              className="group flex w-full items-center gap-2.5 py-2.5 text-left text-[14px] text-ink-2 transition-colors duration-150 hover:text-ink"
            >
              <MessageSquare className="size-4 shrink-0 text-ink-3" />
              <span className="flex-1">{item}</span>
              <ArrowRight className="size-4 text-ink-4 transition-[translate,color] duration-150 ease-out-quint group-hover:translate-x-1 group-hover:text-ink-2" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
