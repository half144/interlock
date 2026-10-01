import { Asterisk, Hexagon, Sparkle, type LucideIcon } from "lucide-react";
import type { AgentKind } from "@/types";
import { cn } from "@/lib/utils";

const marks: Record<AgentKind, { icon: LucideIcon; tint: string }> = {
  claude: { icon: Asterisk, tint: "bg-[#d9775729] text-[#eba184]" },
  codex: { icon: Hexagon, tint: "bg-selected text-ink-2" },
  gemini: { icon: Sparkle, tint: "bg-[#6aa4ff24] text-[#9cc2ff]" },
};

/** Agent CLI avatar: a small tinted disc with a neutral glyph (not the vendor's logo). */
export function AgentMark({ kind, className }: { kind: AgentKind; className?: string }) {
  const { icon: Icon, tint } = marks[kind];
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-[18px] shrink-0 items-center justify-center rounded-full",
        tint,
        className,
      )}
    >
      <Icon className="size-[11px]" strokeWidth={2.4} />
    </span>
  );
}
