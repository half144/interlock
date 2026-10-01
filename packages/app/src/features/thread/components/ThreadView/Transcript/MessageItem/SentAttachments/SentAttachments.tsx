import { FileText, Image } from "lucide-react";
import type { MessageAttachment } from "@/types";

export function SentAttachments({ items }: { items: MessageAttachment[] }) {
  return (
    <ul className="mb-2 flex flex-wrap justify-end gap-1.5" aria-label="Attachments">
      {items.map(({ name, isImage }) => (
        <li
          key={name}
          className="inline-flex h-7 max-w-[220px] items-center gap-1.5 rounded-full bg-inset px-2.5 text-[12.5px] text-ink-2"
        >
          {isImage ? (
            <Image className="size-3.5 shrink-0" />
          ) : (
            <FileText className="size-3.5 shrink-0" />
          )}
          <span className="truncate">{name}</span>
        </li>
      ))}
    </ul>
  );
}
