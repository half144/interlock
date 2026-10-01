import { startTransition, useEffect, useState } from "react";

/**
 * False on the first frame, true right after, in a transition React can pause between frames.
 * Lets a panel start sliding in empty while its heavy content renders without holding up the slide.
 */
export function useDeferredMount() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    startTransition(() => setReady(true));
  }, []);
  return ready;
}
