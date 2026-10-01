import { useEffect, useRef, useState, type ClipboardEvent, type DragEvent } from "react";
import { isImageFile, pastedFiles } from "@/lib/attachments";

export interface DraftAttachment {
  id: string;
  file: File;
  previewUrl: string | null;
}

const carriesFiles = (e: DragEvent) => e.dataTransfer.types.includes("Files");

/** The files waiting to go with the next message, however they arrive: the picker, a drop on the composer or a pasted image. */
export function useAttachmentDraft() {
  const [items, setItems] = useState<DraftAttachment[]>([]);
  const [dragging, setDragging] = useState(false);
  const previews = useRef(new Set<string>());

  useEffect(() => {
    const open = previews.current;
    return () => open.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const add = (files: File[]) => {
    const drafts = files.map((file) => {
      const previewUrl = isImageFile(file) ? URL.createObjectURL(file) : null;
      if (previewUrl) previews.current.add(previewUrl);
      return { id: crypto.randomUUID(), file, previewUrl };
    });
    setItems((all) => [...all, ...drafts]);
  };

  const release = (draft: DraftAttachment) => {
    if (!draft.previewUrl) return;
    URL.revokeObjectURL(draft.previewUrl);
    previews.current.delete(draft.previewUrl);
  };

  const remove = (id: string) => {
    items.filter((d) => d.id === id).forEach(release);
    setItems((all) => all.filter((d) => d.id !== id));
  };

  const clear = () => {
    items.forEach(release);
    setItems([]);
  };

  const dropTarget = {
    onDragOver: (e: DragEvent) => {
      if (!carriesFiles(e)) return;
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: (e: DragEvent) => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
    },
    onDrop: (e: DragEvent) => {
      if (!carriesFiles(e)) return;
      e.preventDefault();
      setDragging(false);
      add(Array.from(e.dataTransfer.files));
    },
  };

  const onPaste = (e: ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files);
    if (files.length === 0) return;
    e.preventDefault();
    add(pastedFiles(files));
  };

  return {
    items,
    files: items.map((d) => d.file),
    add,
    remove,
    clear,
    dragging,
    dropTarget,
    onPaste,
  };
}
