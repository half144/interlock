import { useLayoutEffect, useRef, type ReactNode } from "react";

/** Renders a page at its real desktop width and scales it down to fit the panel, like a browser zoomed out. */
export function ScaledFrame({ width, children }: { width: number; children: ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  // Written straight to the DOM: while a panel animates, this fires every frame, and a React update
  // per frame re-renders the whole mock and drops frames.
  useLayoutEffect(() => {
    const measure = () => {
      const scale = Math.min(1, outer.current!.clientWidth / width);
      inner.current!.style.transform = `scale(${scale})`;
      outer.current!.style.height = `${inner.current!.offsetHeight * scale}px`;
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer.current!);
    observer.observe(inner.current!);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div ref={outer} className="relative overflow-hidden">
      <div ref={inner} className="absolute top-0 left-0 origin-top-left" style={{ width }}>
        {children}
      </div>
    </div>
  );
}
