/** Interlock mark: two linked rings drawn in ink. */
export function LogoMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden>
      <circle cx="7.4" cy="10" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12.6" cy="10" r="4.6" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}
