import { describe, expect, it } from "vitest";
import { outputStep, setupNotice, setupOutput, toTerminalText } from "./setupOutput";

describe("setupOutput", () => {
  it("is empty before setup has reported", () => {
    expect(setupOutput(undefined)).toBe("");
  });

  it("is the log, with the reason after it when setup failed", () => {
    expect(setupOutput({ state: "running", log: "npm i\n", error: null })).toBe("npm i\n");
    expect(setupOutput({ state: "failed", log: "npm i\n", error: "exit 1" })).toBe(
      "npm i\n\nexit 1\n",
    );
  });
});

describe("toTerminalText", () => {
  it("turns line feeds into CRLF without doubling existing ones", () => {
    expect(toTerminalText("a\nb\r\nc")).toBe("a\r\nb\r\nc");
  });
});

describe("outputStep", () => {
  it("writes only what was added", () => {
    expect(outputStep("one\n", "one\ntwo\n")).toEqual({ reset: false, text: "two\r\n" });
  });

  it("starts over when the earlier output changed", () => {
    expect(outputStep("one\n", "uno\n")).toEqual({ reset: true, text: "uno\r\n" });
  });

  it("writes nothing when nothing changed", () => {
    expect(outputStep("a", "a")).toEqual({ reset: false, text: "" });
  });
});

describe("setupNotice", () => {
  it("explains an empty screen by what setup is doing", () => {
    expect(setupNotice(undefined)).toMatch(/shows up here/);
    expect(setupNotice({ state: "running", log: "", error: null })).toMatch(/Running/);
    expect(setupNotice({ state: "blocked", log: "", error: null })).toMatch(/did not run/);
    expect(setupNotice({ state: "completed", log: "", error: null })).toMatch(/without printing/);
  });

  it("stays quiet once there is output", () => {
    expect(setupNotice({ state: "running", log: "npm i\n", error: null })).toBeNull();
    expect(setupNotice({ state: "failed", log: "", error: "exit 1" })).toBeNull();
  });
});
