import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Kbd } from "@/components/ui/Kbd/Kbd";
import { field } from "@/lib/styles";
import { cn } from "@/lib/utils";

interface CommentComposerProps {
  onSubmit: (text: string) => void;
  onCancel: () => void;
}

export function CommentComposer({ onSubmit, onCancel }: CommentComposerProps) {
  const [text, setText] = useState("");
  const submit = () => text.trim() && onSubmit(text.trim());

  return (
    <div className="flex flex-col gap-2">
      <textarea
        autoFocus
        rows={3}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Leave a note for the agent on this line"
        className={cn(field, "w-full resize-none px-3 py-2 font-sans")}
      />
      <div className="flex items-center justify-end gap-1.5">
        <Button size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={submit} disabled={!text.trim()}>
          Add comment
          <Kbd>⌘↵</Kbd>
        </Button>
      </div>
    </div>
  );
}
