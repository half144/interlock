import { cn } from "@/lib/utils";
import { languageOf } from "@/features/workspace/utils/language";

/** The file-type mark editors put before a name (TS, {}, SQL), so a file reads at a glance. */
export function FileGlyph({ path, className }: { path: string; className?: string }) {
  const { glyph, tone } = languageOf(path);
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex w-[18px] shrink-0 justify-center font-sans text-[9.5px] font-bold tracking-tight",
        tone,
        className,
      )}
    >
      {glyph}
    </span>
  );
}
