import { describe, expect, it } from "vitest";
import { todoToSteps } from "./plan";

describe("todoToSteps", () => {
  it("keeps the real status and activeForm", () => {
    const steps = todoToSteps([
      { text: "A", completed: true, status: "completed" },
      { text: "B", completed: false, status: "in_progress", activeForm: "Doing B" },
      { text: "C", completed: false, status: "pending" },
    ]);
    expect(steps.map((s) => s.status)).toEqual(["completed", "in_progress", "pending"]);
    expect(steps[1]?.activeForm).toBe("Doing B");
    expect(steps[0]).not.toHaveProperty("activeForm");
  });

  it("treats the first unfinished item as in progress when no status is reported", () => {
    const steps = todoToSteps([
      { text: "A", completed: true },
      { text: "B", completed: false },
      { text: "C", completed: false },
    ]);
    expect(steps.map((s) => s.status)).toEqual(["completed", "in_progress", "pending"]);
  });

  it("does not invent an in-progress item when statuses are reported", () => {
    const steps = todoToSteps([
      { text: "A", completed: true, status: "completed" },
      { text: "B", completed: false, status: "pending" },
    ]);
    expect(steps.map((s) => s.status)).toEqual(["completed", "pending"]);
  });
});
