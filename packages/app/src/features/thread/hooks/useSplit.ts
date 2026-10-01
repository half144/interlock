import { useLayoutEffect, useRef } from "react";
import { animate, useMotionValue, useReducedMotion, type MotionValue } from "motion/react";
import { dock } from "@/lib/motion";
import { MIN_APP_WIDTH } from "@/lib/layout";
import { useViewportWidth } from "@/hooks/useViewportWidth";
import { SIDEBAR_WIDTH } from "@/hooks/useRail";

/** The chat on its own keeps its usual reading width; it only narrows to sit beside the open panel. */
const READING_WIDTH = 700;
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** With the panel open the work gets the room: the chat keeps about 40%, as Manus does, within readable limits. */
const splitWidth = (main: number) => clamp(main * 0.4, 420, 580);
/** In the mini-IDE the chat becomes a side column, like an editor's assistant pane. */
const ideChatWidth = (main: number) => clamp(main * 0.25, 340, 420);

type Frame = {
  chatLeft: number;
  chatWidth: number;
  panelLeft: number;
  panelWidth: number;
  reading: number;
};

function frameFor(
  viewport: number,
  sidebar: number,
  panelOpen: boolean,
  maximized: boolean,
): Frame {
  const main = viewport - sidebar;
  if (maximized) {
    const chat = ideChatWidth(main);
    return {
      chatLeft: main - chat,
      chatWidth: chat,
      panelLeft: 0,
      panelWidth: main - chat,
      reading: chat,
    };
  }
  const split = splitWidth(main);
  if (panelOpen)
    return {
      chatLeft: 0,
      chatWidth: split,
      panelLeft: split,
      panelWidth: main - split,
      reading: split,
    };
  // Closed, the panel waits just past the right edge at the width it will open to (the sidebar folds to a rail
  // as it opens), so opening slides it in whole instead of reflowing it every frame.
  const docked = viewport - SIDEBAR_WIDTH.rail;
  return {
    chatLeft: 0,
    chatWidth: main,
    panelLeft: main,
    panelWidth: docked - splitWidth(docked),
    reading: Math.min(READING_WIDTH, main),
  };
}

/**
 * Where the chat and the side panel sit, as motion values on one spring with the sidebar.
 * - Opening the panel: the chat narrows to the conversation's width and the panel rides in on its edge.
 * - Maximizing the review: the panel slides left and grows into files + code while the chat leaves its spot,
 *   crosses unseen, and docks on the right. Nothing crosses visibly; every edge lands on the same frame.
 * Targets are worked out from where the sidebar is heading, not where it is mid-flight, and resizing the
 * window just follows.
 */
export function useSplit(panelOpen: boolean, sidebar: number, maximized: boolean) {
  const viewport = useViewportWidth(MIN_APP_WIDTH);
  const target = frameFor(viewport, sidebar, panelOpen, maximized);
  const values = {
    chatLeft: useMotionValue(target.chatLeft),
    chatWidth: useMotionValue(target.chatWidth),
    panelLeft: useMotionValue(target.panelLeft),
    panelWidth: useMotionValue(target.panelWidth),
    reading: useMotionValue(target.reading),
  } satisfies Record<keyof Frame, MotionValue<number>>;
  const chatOpacity = useMotionValue(1);
  const reduce = useReducedMotion();
  const layout = useRef({ panelOpen, sidebar, maximized });
  const key = Object.values(target).join();

  useLayoutEffect(() => {
    const previous = layout.current;
    layout.current = { panelOpen, sidebar, maximized };
    const toggled =
      previous.panelOpen !== panelOpen ||
      previous.sidebar !== sidebar ||
      previous.maximized !== maximized;
    const keys = Object.keys(values) as (keyof Frame)[];
    if (!toggled || reduce) {
      keys.forEach((k) => values[k].set(target[k]));
      return;
    }
    const runs = keys.map((k) => animate(values[k], target[k], dock));
    // The chat swaps sides only when the review is maximized or restored: it fades out of its old spot,
    // travels unseen, and fades in as it settles into the new one.
    if (previous.maximized !== maximized) {
      runs.push(
        animate(chatOpacity, [1, 0, 0, 1], {
          duration: 0.56,
          times: [0, 0.18, 0.5, 1],
          ease: "easeInOut",
        }),
      );
    }
    return () => runs.forEach((run) => run.stop());
    // `key` stands in for the target numbers; the motion values themselves are stable.
  }, [key, panelOpen, sidebar, maximized, reduce]);

  return { ...values, chatOpacity };
}
