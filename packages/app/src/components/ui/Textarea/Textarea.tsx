import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { field } from "@/lib/styles";

/** A multi-line text field, filled like `Input`. */
export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(field, "w-full px-3 py-2.5 leading-relaxed", className)} {...rest} />
  );
}
