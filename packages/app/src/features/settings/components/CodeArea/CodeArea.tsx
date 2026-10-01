import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/Textarea/Textarea";
import { monoText } from "@/lib/styles";

/** A mono, resizable textarea for scripts and file patterns. */
export function CodeArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Textarea
      spellCheck={false}
      className={cn(monoText, "resize-y leading-[1.7]", className)}
      {...rest}
    />
  );
}
