import { useEffect, useState } from "react";

/** The window's width, kept current on resize, never narrower than `min`. */
export function useViewportWidth(min = 0) {
  const [width, setWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return Math.max(width, min);
}
