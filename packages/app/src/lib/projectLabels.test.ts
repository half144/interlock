import { describe, expect, it } from "vitest";
import { projectLabels } from "./projectLabels";

const project = (id: string, name: string, rootPath: string) => ({ id, name, rootPath });

describe("projectLabels", () => {
  it("leaves a unique name alone", () => {
    const labels = projectLabels([
      project("a", "api", "/code/api"),
      project("b", "web", "/code/web"),
    ]);
    expect(labels).toEqual({ a: "api", b: "web" });
  });

  it("adds the parent folder when two projects share a name", () => {
    const labels = projectLabels([
      project("a", "app", "/work/app"),
      project("b", "app", "/play/app"),
    ]);
    expect(labels).toEqual({ a: "app · work", b: "app · play" });
  });

  it("goes up until the paths differ", () => {
    const labels = projectLabels([
      project("a", "app", "/x/src/app"),
      project("b", "app", "/y/src/app"),
      project("c", "web", "/y/src/web"),
    ]);
    expect(labels).toEqual({ a: "app · x/src", b: "app · y/src", c: "web" });
  });
});
