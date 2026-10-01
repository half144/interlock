import { describe, expect, it } from "vitest";
import { terminalTheme } from "./terminalTheme";

describe("terminalTheme", () => {
  it("takes the surface and text colours from the design tokens", () => {
    const theme = terminalTheme((name) => `<${name}>`);
    expect(theme.background).toBe("<--color-inset>");
    expect(theme.foreground).toBe("<--color-ink-2>");
    expect(theme.red).toBe("<--color-red>");
  });
});
