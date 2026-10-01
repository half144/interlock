import { cn } from "@/lib/utils";
import { monoText } from "@/lib/styles";

export function Swatch({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-2.5">
      <p className="text-[12px] text-ink-3">{label}</p>
      <div
        className={cn(
          monoText,
          "mt-1 flex h-8 items-center gap-2 rounded-lg bg-inset px-2 text-ink",
        )}
      >
        <span className="size-4 rounded-[4px] border border-seam-2" style={{ background: value }} />
        {value}
      </div>
    </div>
  );
}
