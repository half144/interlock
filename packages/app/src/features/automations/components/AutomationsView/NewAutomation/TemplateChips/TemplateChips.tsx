import { TEMPLATES, type Draft } from "@/features/automations/utils/draft";

/** One-click starting points for the new-automation form. */
export function TemplateChips({ onPick }: { onPick: (draft: Partial<Draft>) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[12.5px] text-ink-3">Start from</span>
      {TEMPLATES.map((t) => (
        <button
          key={t.label}
          type="button"
          onClick={() => onPick(t.draft)}
          className="inline-flex h-7 items-center rounded-full border border-seam-2 px-3 text-[12.5px] text-ink-2 transition-colors duration-150 hover:bg-hover hover:text-ink"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
