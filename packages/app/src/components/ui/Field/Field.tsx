import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { fieldLabel } from "@/lib/styles";

interface FieldProps {
  label: string;
  children: ReactNode;
  className?: string;
}

/** A labelled form control. */
export function Field({ label, children, className }: FieldProps) {
  return (
    <label className={cn("flex flex-col gap-2", className)}>
      <span className={fieldLabel}>{label}</span>
      {children}
    </label>
  );
}
