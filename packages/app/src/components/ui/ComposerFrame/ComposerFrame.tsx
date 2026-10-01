import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { surface } from "@/lib/styles";

/** The rounded surface every composer sits in; a soft ring lights up while you type in it. */
export function ComposerFrame({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(surface.composer, className)} {...rest} />;
}
