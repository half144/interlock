import { describe, expect, it } from "vitest";
import type { Check, CheckState } from "@/types";
import { summarizeChecks } from "./checks";

const check = (state: CheckState): Check => ({
  id: state,
  name: state,
  state,
  duration: null,
  url: null,
  workflow: null,
});

describe("summarizeChecks", () => {
  it("has nothing to say without checks", () => {
    expect(summarizeChecks([])).toEqual({ state: "none", total: 0, label: "No checks" });
  });

  it("counts what passed, skipped checks aside", () => {
    expect(summarizeChecks([check("success"), check("success"), check("skipped")])).toEqual({
      state: "passing",
      total: 3,
      label: "2/3 checks passed",
    });
  });

  it("puts a failure ahead of checks still running", () => {
    expect(summarizeChecks([check("pending"), check("failure"), check("cancelled")])).toMatchObject(
      { state: "failing", label: "2 checks failing" },
    );
  });

  it("reports running checks", () => {
    expect(summarizeChecks([check("success"), check("pending")])).toMatchObject({
      state: "pending",
      label: "1 check running",
    });
  });
});
