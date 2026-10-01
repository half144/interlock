import { describe, expect, it } from "vitest";
import type { HoldQuestion } from "@/types";
import { allAnswered, buildAnswers, togglePick } from "./questions";

const choice: HoldQuestion = {
  header: "surface",
  question: "Which surface?",
  options: [{ label: "App" }, { label: "Desktop" }],
  multiSelect: false,
};
const free: HoldQuestion = {
  header: "success",
  question: "Done when?",
  options: [],
  multiSelect: false,
};
const multi: HoldQuestion = { ...choice, header: "targets", multiSelect: true };

describe("togglePick", () => {
  it("replaces the pick of a single-choice question and clears it on a second click", () => {
    expect(togglePick(choice, ["App"], "Desktop")).toEqual(["Desktop"]);
    expect(togglePick(choice, ["App"], "App")).toEqual([]);
  });

  it("toggles each pick of a multi-choice question", () => {
    expect(togglePick(multi, ["App"], "Desktop")).toEqual(["App", "Desktop"]);
    expect(togglePick(multi, ["App", "Desktop"], "App")).toEqual(["Desktop"]);
  });
});

describe("allAnswered", () => {
  it("needs every question answered", () => {
    expect(allAnswered([choice, free], { 0: ["App"] }, {})).toBe(false);
    expect(allAnswered([choice, free], { 0: ["App"] }, { 1: " yes " })).toBe(true);
  });

  it("lets a blank free-text question through when it allows empty", () => {
    expect(allAnswered([{ ...free, allowEmpty: true }], {}, {})).toBe(true);
  });

  it("does not take typed text for a question without a text field", () => {
    expect(allAnswered([choice], {}, { 0: "Other" })).toBe(false);
  });
});

describe("buildAnswers", () => {
  it("answers by header, joining multiple picks", () => {
    expect(
      buildAnswers([choice, multi, free], { 0: ["App"], 1: ["App", "Desktop"] }, { 2: " fast " }),
    ).toEqual({
      surface: "App",
      targets: "App, Desktop",
      success: "fast",
    });
  });

  it("prefers typed text where the question accepts it", () => {
    const open = { ...choice, allowOther: true };
    expect(buildAnswers([open], { 0: ["App"] }, { 0: "Web" })).toEqual({ surface: "Web" });
  });

  it("sends an empty answer for an optional blank question", () => {
    expect(buildAnswers([{ ...free, allowEmpty: true }], {}, {})).toEqual({ success: "" });
  });
});
