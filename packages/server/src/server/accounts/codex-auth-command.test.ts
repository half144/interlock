import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import pino from "pino";
import { expect, it } from "vitest";
import { CodexAuth } from "./codex-auth.js";

it("starts the selected Codex executable and prefix with app-server for account operations", async () => {
  const dir = mkdtempSync(join(tmpdir(), "interlock-codex-command-"));
  const fixture = join(dir, "mock codex.mjs");
  const argvFile = join(dir, "argv.json");
  writeFileSync(
    fixture,
    `
    import { writeFileSync } from "node:fs";
    import { createInterface } from "node:readline";
    writeFileSync(${JSON.stringify(argvFile)}, JSON.stringify(process.argv.slice(2)));
    createInterface({ input: process.stdin }).on("line", (line) => {
      const request = JSON.parse(line);
      if (request.id === undefined) return;
      const result = request.method === "account/read" ? { account: { type: "chatgpt", email: "test@example.com", planType: "plus" } } : {};
      process.stdout.write(JSON.stringify({ id: request.id, result }) + "\\n");
    });
  `,
  );
  try {
    const auth = new CodexAuth({
      logger: pino({ level: "silent" }),
      resolveCommand: async () => ({
        command: process.execPath,
        args: [fixture, "--profile", "work"],
      }),
    });
    expect(await auth.status()).toMatchObject({ loggedIn: true, account: "test@example.com" });
    await auth.logout();
    expect(JSON.parse(readFileSync(argvFile, "utf8"))).toEqual(["--profile", "work", "app-server"]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
