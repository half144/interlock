export interface Hotspot {
  tag: string;
  name: string;
  box: { left: number; top: number; width: number; height: number };
  background: string;
  color: string;
}

const hex = (rgb: string) => {
  const m = rgb.match(/\d+(\.\d+)?/g);
  if (!m || (m.length === 4 && Number(m[3]) === 0)) return "transparent";
  return `#${m
    .slice(0, 3)
    .map((n) => Math.round(Number(n)).toString(16).padStart(2, "0"))
    .join("")}`.toUpperCase();
};

function targets(root: HTMLElement): { el: Element; tag: string; name: string }[] {
  const found: { el: Element; tag: string; name: string }[] = [];
  const listbox = root.querySelector('[role="listbox"]');
  if (listbox?.parentElement)
    found.push({ el: listbox.parentElement, tag: "div", name: "Street address field" });
  const cta = [...root.querySelectorAll("span")].find(
    (s) => s.textContent?.trim() === "Continue to payment",
  );
  if (cta) found.push({ el: cta, tag: "button", name: "Continue button" });
  const aside = root.querySelector("aside");
  if (aside) found.push({ el: aside, tag: "section", name: "Order summary" });
  if (found.length) return found;

  for (const selector of ["header", "section", "aside", "pre", "table"]) {
    const el = root.querySelector(selector);
    if (el && found.length < 3)
      found.push({
        el,
        tag: selector === "header" ? "div" : "section",
        name: selector.charAt(0).toUpperCase() + selector.slice(1),
      });
  }
  return found;
}

/** Finds a few editable regions in the rendered preview and measures them against the overlay root. */
export function measureHotspots(root: HTMLElement): Hotspot[] {
  const origin = root.getBoundingClientRect();
  return targets(root).map(({ el, tag, name }) => {
    const r = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return {
      tag,
      name,
      box: {
        left: r.left - origin.left,
        top: r.top - origin.top,
        width: r.width,
        height: r.height,
      },
      background: hex(style.backgroundColor),
      color: hex(style.color),
    };
  });
}
