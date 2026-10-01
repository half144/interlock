import type { Aspect } from "@/types";

const R = 5.25;
const C = 2 * Math.PI * R;

/** The drawing inside a Lamp, one shape per status. Cut-outs use the ground colour so they read as holes. */
export function LampGlyph({
  aspect,
  progress,
  color,
}: {
  aspect: Aspect;
  progress: number;
  color: string;
}) {
  return (
    <>
      {aspect === "running" && (
        <>
          <circle cx="7" cy="7" r="6" fill="none" stroke={color} strokeWidth="1.5" opacity="0.35" />
          <circle
            cx="7"
            cy="7"
            r={R / 2}
            fill="none"
            stroke={color}
            strokeWidth={R}
            strokeDasharray={`${(C / 2) * Math.max(0.06, Math.min(1, progress))} ${C}`}
            transform="rotate(-90 7 7)"
            className="transition-[stroke-dasharray] duration-700 ease-out"
          />
        </>
      )}
      {aspect === "held" && (
        <>
          <circle cx="7" cy="7" r="6.25" fill={color} className="animate-lamp-hold" />
          <rect x="6.25" y="3.4" width="1.5" height="4.6" rx="0.75" fill="var(--color-ground)" />
          <circle cx="7" cy="10.1" r="0.85" fill="var(--color-ground)" />
        </>
      )}
      {aspect === "queued" && (
        <circle
          cx="7"
          cy="7"
          r="6"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray="2.2 2.2"
        />
      )}
      {aspect === "review" && (
        <>
          <circle cx="7" cy="7" r="6" fill="none" stroke={color} strokeWidth="1.5" />
          <circle cx="7" cy="7" r="3" fill={color} />
        </>
      )}
      {aspect === "merged" && (
        <>
          <circle cx="7" cy="7" r="6.25" fill={color} />
          <path
            d="M4.4 7.2l1.8 1.8 3.5-3.7"
            fill="none"
            stroke="var(--color-ground)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}
      {aspect === "failed" && (
        <>
          <circle cx="7" cy="7" r="6.25" fill={color} />
          <path
            d="M4.9 4.9l4.2 4.2M9.1 4.9l-4.2 4.2"
            stroke="var(--color-ground)"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </>
      )}
      {aspect === "discarded" && (
        <>
          <circle cx="7" cy="7" r="6" fill="none" stroke={color} strokeWidth="1.5" />
          <path d="M3.2 10.8l7.6-7.6" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
    </>
  );
}
