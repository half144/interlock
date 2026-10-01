import { describe, expect, it } from "vitest";
import { remoteLabel } from "./remote";

describe("remoteLabel", () => {
  it("reads owner/repo from ssh and https remotes", () => {
    expect(remoteLabel("git@github.com:acme/app.git")).toBe("acme/app");
    expect(remoteLabel("https://github.com/acme/app")).toBe("acme/app");
    expect(remoteLabel("https://github.com/acme/app.git")).toBe("acme/app");
  });

  it("keeps a local path's last two segments", () => {
    expect(remoteLabel("/private/tmp/g10a-remote.git")).toBe("tmp/g10a-remote");
  });
});
