import { describe, expect, it } from "vitest";
import { toFileDiffs, type DiffFilePayload } from "./diff";

const file: DiffFilePayload = {
  path: "a.ts",
  isNew: false,
  isDeleted: false,
  additions: 1,
  deletions: 1,
  hunks: [
    {
      oldStart: 10,
      oldCount: 3,
      newStart: 12,
      newCount: 3,
      lines: [
        { type: "header", content: "@@ ignored" },
        { type: "context", content: "keep" },
        { type: "remove", content: "old" },
        { type: "add", content: "new" },
        { type: "context", content: "tail" },
      ],
    },
  ],
};

describe("toFileDiffs", () => {
  it("numbers lines from the hunk starts and skips header lines", () => {
    const [diff] = toFileDiffs([file]);
    expect(diff?.hunks[0]).toEqual({
      header: "@@ -10,3 +12,3 @@",
      lines: [
        { kind: "ctx", text: "keep", oldNo: 10, newNo: 12 },
        { kind: "del", text: "old", oldNo: 11 },
        { kind: "add", text: "new", newNo: 13 },
        { kind: "ctx", text: "tail", oldNo: 12, newNo: 14 },
      ],
    });
    expect(diff).toMatchObject({ status: "modified" });
    expect(diff).not.toHaveProperty("oldPath");
    expect(diff).not.toHaveProperty("omitted");
  });

  it("maps status, rename and omitted files", () => {
    const [added, binary, renamed] = toFileDiffs([
      { ...file, isNew: true },
      { ...file, isDeleted: true, status: "binary", hunks: [] },
      { ...file, oldPath: "b.ts" },
    ]);
    expect(added?.status).toBe("added");
    expect(binary).toMatchObject({ status: "deleted", omitted: "binary" });
    expect(renamed?.oldPath).toBe("b.ts");
  });
});
