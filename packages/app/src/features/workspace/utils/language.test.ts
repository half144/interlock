import { describe, expect, it } from "vitest";
import { fileName, languageOf } from "./language";

describe("languageOf", () => {
  it("reads the language from the extension", () => {
    expect(languageOf("src/a.ts").name).toBe("TypeScript");
    expect(languageOf("src/App.TSX").name).toBe("TypeScript JSX");
    expect(languageOf("pkg/x.mjs").name).toBe("JavaScript");
  });

  it("falls back to plain text for unknown and extensionless files", () => {
    expect(languageOf("notes.xyz").name).toBe("Plain Text");
    expect(languageOf("Makefile").name).toBe("Plain Text");
    expect(languageOf("dir.d/Makefile").name).toBe("Plain Text");
  });
});

describe("fileName", () => {
  it("is the last segment of the path", () => {
    expect(fileName("a/b/c.ts")).toBe("c.ts");
    expect(fileName("c.ts")).toBe("c.ts");
  });
});
