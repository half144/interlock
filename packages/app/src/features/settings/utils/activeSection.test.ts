import { describe, expect, it } from "vitest";
import { activeSection } from "./activeSection";

const ids = ["general", "scripts", "danger"];

describe("activeSection", () => {
  it("starts on the first section", () => {
    expect(activeSection({ general: 40, scripts: 600, danger: 1200 }, ids, false)).toBe("general");
  });

  it("follows the last heading above the read line", () => {
    expect(activeSection({ general: -500, scripts: 80, danger: 700 }, ids, false)).toBe("scripts");
  });

  it("lands on the last section at the end of the page", () => {
    expect(activeSection({ general: -900, scripts: -300, danger: 300 }, ids, true)).toBe("danger");
  });
});
