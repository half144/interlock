import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { field, monoText } from "@/lib/styles";

/** A single-line text field; `mono` for paths, commands and other literal values. */
export function Input({ mono, className, ...rest }: ComponentProps<"input"> & { mono?: boolean }) {
  return <input className={cn(field, "h-9 px-3", mono && monoText, className)} {...rest} />;
}
