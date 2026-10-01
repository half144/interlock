import { FileText, X } from "lucide-react";
import { sizeLabel } from "@/lib/attachments";
import type { DraftAttachment } from "@/hooks/useAttachmentDraft";

export function AttachmentChips({
  items,
  onRemove,
}: {
  items: DraftAttachment[];
  onRemove: (id: string) => void;
}) {
  if (items.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2 px-4 pt-3" aria-label="Attachments">
      {items.map(({ id, file, previewUrl }) => (
        <li
          key={id}
          className="group relative flex h-10 max-w-[220px] items-center gap-2 rounded-lg bg-inset py-1 pr-7 pl-1 text-[12.5px] text-ink-2"
        >
          {previewUrl ? (
            <img src={previewUrl} alt="" className="size-8 shrink-0 rounded-md object-cover" />
          ) : (
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-hover text-ink-3">
              <FileText className="size-4" />
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate text-ink">{file.name}</span>
            <span className="block text-[11px] text-ink-4">{sizeLabel(file.size)}</span>
          </span>
          <button
            type="button"
            aria-label={`Remove ${file.name}`}
            onClick={() => onRemove(id)}
            className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-selected hover:text-ink"
          >
            <X className="size-3" />
          </button>
        </li>
      ))}
    </ul>
  );
}
