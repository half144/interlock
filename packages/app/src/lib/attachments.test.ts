import { describe, expect, it } from "vitest";
import { isImageFile, pastedFiles, pastedName, sizeLabel, toBase64 } from "./attachments";

describe("attachments", () => {
  it("tells images from other files by mime type", () => {
    expect(isImageFile({ type: "image/png" })).toBe(true);
    expect(isImageFile({ type: "application/pdf" })).toBe(false);
    expect(isImageFile({ type: "" })).toBe(false);
  });

  it("encodes bytes as base64, past the chunk size", () => {
    expect(toBase64(new TextEncoder().encode("hello"))).toBe("aGVsbG8=");
    const big = new Uint8Array(0x8000 * 2 + 5).fill(65);
    expect(atob(toBase64(big))).toBe("A".repeat(big.length));
  });

  it("labels sizes", () => {
    expect(sizeLabel(512)).toBe("512 B");
    expect(sizeLabel(2048)).toBe("2 KB");
    expect(sizeLabel(3 * 1024 * 1024)).toBe("3.0 MB");
  });

  it("names pasted screenshots and keeps real file names", () => {
    expect(pastedName({ name: "image.png", type: "image/png" }, 0)).toBe("pasted-image-1.png");
    expect(pastedName({ name: "", type: "image/jpeg" }, 1)).toBe("pasted-image-2.jpeg");
    expect(pastedName({ name: "shot.png", type: "image/png" }, 0)).toBe("shot.png");
  });

  it("renames pasted screenshots into new files and leaves named files alone", () => {
    const shot = new File(["x"], "image.png", { type: "image/png" });
    const named = new File(["y"], "notes.txt", { type: "text/plain" });
    const [renamed, same] = pastedFiles([shot, named]);
    expect(renamed?.name).toBe("pasted-image-1.png");
    expect(renamed?.type).toBe("image/png");
    expect(same).toBe(named);
  });
});
