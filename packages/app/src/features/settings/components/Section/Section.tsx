import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { surface } from "@/lib/styles";

/** A titled settings group; `id` is the anchor the section nav scrolls to, `aside` sits beside the title. */
export function Section({
  id,
  title,
  description,
  aside,
  children,
}: {
  id: string;
  title: string;
  description?: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-6 pt-10 first:pt-0">
      <div className="flex items-center justify-between gap-4">
        <h2 id={`${id}-title`} className="text-[15px] font-medium tracking-[-0.01em] text-ink">
          {title}
        </h2>
        {aside}
      </div>
      {description && <p className="mt-1 max-w-[68ch] text-[13px] text-ink-3">{description}</p>}
      <div className={cn("mt-4 divide-y divide-seam shadow-card", surface.frame)}>{children}</div>
    </section>
  );
}
