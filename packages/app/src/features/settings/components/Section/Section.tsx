import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { surface } from "@/lib/styles";

/** A titled settings group; `id` is the anchor the section nav scrolls to. */
export function Section({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 pt-10 first:pt-0">
      <h2 id={`${id}-title`} className="text-[15px] font-medium tracking-[-0.01em] text-ink">
        {title}
      </h2>
      {description && <p className="mt-1 max-w-[68ch] text-[13px] text-ink-3">{description}</p>}
      <div className={cn("mt-4 divide-y divide-seam shadow-card", surface.frame)}>{children}</div>
    </section>
  );
}
