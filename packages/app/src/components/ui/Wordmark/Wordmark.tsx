import { cn } from "@/lib/utils";
import { LogoMark } from "../LogoMark/LogoMark";

/** Mark and name together, as in the sidebar header and above every agent message. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-ink", className)}>
      <LogoMark />
      <span className="font-serif text-[17px] leading-none tracking-[-0.01em]">interlock</span>
    </span>
  );
}
