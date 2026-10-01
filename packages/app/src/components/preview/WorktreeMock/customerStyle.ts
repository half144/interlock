import type { CSSProperties } from "react";

/** The customer's own product styling, used only inside the preview mocks: their font, and their brand blue for mocks to read. */
export const customerStyle: CSSProperties & { "--customer-brand": string } = {
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
  "--customer-brand": "#1d3fbb",
};
