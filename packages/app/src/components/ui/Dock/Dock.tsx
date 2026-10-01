import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Each layer blurs from a lower starting line, so the stack adds up to more blur the closer content gets to the dock. */
const BLURS = [0.5, 1, 2, 4];

const layer = (px: number, i: number): CSSProperties => {
  const mask = `linear-gradient(to bottom, transparent ${(i / BLURS.length) * 100}%, black ${((i + 1) / BLURS.length) * 100}%)`;
  return {
    backdropFilter: `blur(${px}px)`,
    WebkitBackdropFilter: `blur(${px}px)`,
    maskImage: mask,
    WebkitMaskImage: mask,
  };
};

/**
 * Pins a composer to the bottom of its scroll area. The conversation scrolls underneath and, just above
 * the dock, blurs and darkens progressively instead of being cut off at a hard edge. `surface` must match
 * the scroll area's background.
 */
export function Dock({
  surface,
  className,
  children,
}: {
  surface: "panel" | "raised";
  className?: string;
  children: ReactNode;
}) {
  const color = `var(--color-${surface})`;
  return (
    <div
      className={cn("sticky bottom-0 z-10 pt-10", className)}
      style={{
        // The top of the band only blurs; the darkening starts below it, so both read.
        backgroundImage: `linear-gradient(to bottom, transparent 0.75rem, color-mix(in srgb, ${color} 40%, transparent) 1.75rem, ${color} 2.5rem)`,
      }}
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-10">
        {BLURS.map((px, i) => (
          <div key={px} className="absolute inset-0" style={layer(px, i)} />
        ))}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
