// Tauri writes the DMG with zlib. LZMA (UDBZ is worse, ULFO is faster but bigger) makes it about a quarter
// smaller, and macOS 10.15 and later read it.
import { execFileSync } from "node:child_process";
import { readdirSync, renameSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dmgDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "../src-tauri/target/release/bundle/dmg",
);

for (const name of readdirSync(dmgDir).filter((file) => file.endsWith(".dmg"))) {
  const source = join(dmgDir, name);
  const shrunk = join(dmgDir, `shrunk-${name}`);
  rmSync(shrunk, { force: true });
  execFileSync("hdiutil", ["convert", source, "-format", "ULMO", "-o", shrunk], {
    stdio: "ignore",
  });
  renameSync(shrunk, source);
}
