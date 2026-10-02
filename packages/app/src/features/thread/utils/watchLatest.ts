import { followStep } from "./follow";

const STICK_DISTANCE = 96;
const FAR_AWAY = 240;

interface WatchOptions {
  scroller: HTMLElement;
  content: HTMLElement | null;
  dock: HTMLElement | null;
  pinned: { current: boolean };
  reduced: boolean;
  onAway: (away: boolean) => void;
}

/**
 * Keeps `scroller` on the bottom of its conversation while `pinned`, gliding after whatever grows it. Returns
 * `follow`, to start a glide, and `stop`. A change of width is the exception to gliding: the text re-wraps and
 * the view stays glued to the bottom that very frame.
 */
export function watchLatest({
  scroller: el,
  content,
  dock,
  pinned,
  reduced,
  onAway,
}: WatchOptions) {
  let frame = 0;
  let last = 0;
  let expected = el.scrollTop;
  let height = el.scrollHeight;
  let width = content?.clientWidth ?? 0;
  const bottom = () => el.scrollHeight - el.clientHeight;

  const tick = (now: number) => {
    frame = 0;
    if (!pinned.current) return;
    const gap = bottom() - el.scrollTop;
    if (gap <= 0) return;
    el.scrollTop += reduced ? gap : followStep(gap, now - last);
    expected = el.scrollTop;
    last = now;
    frame = requestAnimationFrame(tick);
  };
  const follow = () => {
    if (frame || !pinned.current) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };
  const measureAway = () => onAway(!pinned.current && bottom() - el.scrollTop > FAR_AWAY);

  const track = () => {
    const shrank = el.scrollHeight < height;
    height = el.scrollHeight;
    if (Math.abs(el.scrollTop - expected) < 1) return;
    expected = el.scrollTop;
    // The browser pulling the view up because content got shorter is not you scrolling away.
    if (shrank) return;
    pinned.current = bottom() - el.scrollTop < STICK_DISTANCE;
    measureAway();
  };
  const release = (e: WheelEvent) => {
    if (e.deltaY < 0) pinned.current = false;
  };
  const grow = new ResizeObserver(() => {
    const next = content?.clientWidth ?? 0;
    const reflowed = next !== width;
    width = next;
    if (reflowed && pinned.current) {
      el.scrollTop = bottom();
      expected = el.scrollTop;
      return;
    }
    follow();
    measureAway();
  });

  el.addEventListener("scroll", track, { passive: true });
  el.addEventListener("wheel", release, { passive: true });
  if (content) grow.observe(content);
  if (dock) grow.observe(dock);

  return {
    follow,
    stop: () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", track);
      el.removeEventListener("wheel", release);
      grow.disconnect();
    },
  };
}
