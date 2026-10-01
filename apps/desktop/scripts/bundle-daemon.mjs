// Stages the daemon runtime for the Tauri bundle. Layout read by src-tauri/src/daemon.rs:
//   src-tauri/resources/runtime/node/bin/node     official Node (darwin-arm64), checksum-verified
//   src-tauri/resources/runtime/daemon/index.mjs  the daemon, bundled, plus node-pty's prebuild
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const NODE_VERSION = "22.13.1";
const NODE_ARCHIVE = `node-v${NODE_VERSION}-darwin-arm64.tar.gz`;
const NODE_SHA256 = "97483ff4361d239a56d038c6335767a56a291e78c10f07446f463f05d9d19b89";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const runtime = join(root, "apps/desktop/src-tauri/resources/runtime");
const cache = join(
  process.env.INTERLOCK_BUILD_CACHE ?? join(homedir(), "Library/Caches"),
  "interlock-build",
);
const server = join(root, "packages/server");

async function fetchNodeArchive() {
  const archive = join(cache, NODE_ARCHIVE);
  const verified = () =>
    existsSync(archive) &&
    createHash("sha256").update(readFileSync(archive)).digest("hex") === NODE_SHA256;
  if (!verified()) {
    mkdirSync(cache, { recursive: true });
    const response = await fetch(`https://nodejs.org/dist/v${NODE_VERSION}/${NODE_ARCHIVE}`);
    if (!response.ok) throw new Error(`Node download failed: HTTP ${response.status}`);
    writeFileSync(archive, Buffer.from(await response.arrayBuffer()));
    if (!verified()) {
      rmSync(archive);
      throw new Error(`Checksum mismatch for ${NODE_ARCHIVE}; refusing to bundle it.`);
    }
  }
  return archive;
}

async function stageNode() {
  const archive = await fetchNodeArchive();
  const nodeDir = join(runtime, "node");
  rmSync(nodeDir, { recursive: true, force: true });
  mkdirSync(join(nodeDir, "bin"), { recursive: true });
  execFileSync("tar", [
    "-xzf",
    archive,
    "-C",
    join(nodeDir, "bin"),
    "--strip-components=2",
    `node-v${NODE_VERSION}-darwin-arm64/bin/node`,
  ]);
  chmodSync(join(nodeDir, "bin/node"), 0o755);
}

const common = {
  bundle: true,
  platform: "node",
  target: "node22",
  format: "esm",
  logLevel: "warning",
  external: ["node-pty"],
  banner: {
    js: 'import { createRequire as __createRequire } from "node:module"; const require = __createRequire(import.meta.url);',
  },
};

async function bundleDaemon() {
  const daemonDir = join(runtime, "daemon");
  rmSync(daemonDir, { recursive: true, force: true });
  mkdirSync(daemonDir, { recursive: true });
  await build({
    ...common,
    entryPoints: {
      index: join(server, "scripts/supervisor-entrypoint.ts"),
      "daemon-worker": join(server, "src/server/daemon-worker.ts"),
    },
    outdir: daemonDir,
    outExtension: { ".js": ".mjs" },
  });
  // worker-terminal-manager forks `./terminal-worker-process.js` next to the bundle
  await build({
    ...common,
    entryPoints: [join(server, "src/terminal/terminal-worker-process.ts")],
    outfile: join(daemonDir, "terminal-worker-process.js"),
  });
  const { version } = JSON.parse(readFileSync(join(server, "package.json"), "utf8"));
  writeFileSync(
    join(daemonDir, "package.json"),
    `${JSON.stringify({ name: "@interlock/server", version, type: "module" }, null, 2)}\n`,
  );
  const pty = join(root, "node_modules/node-pty");
  const ptyOut = join(daemonDir, "node_modules/node-pty");
  mkdirSync(ptyOut, { recursive: true });
  cpSync(join(pty, "package.json"), join(ptyOut, "package.json"));
  cpSync(join(pty, "lib"), join(ptyOut, "lib"), {
    recursive: true,
    filter: (source) => !/\.test\.|\.map$|\.d\.ts$/.test(source),
  });
  cpSync(join(pty, "prebuilds/darwin-arm64"), join(ptyOut, "prebuilds/darwin-arm64"), {
    recursive: true,
  });
  cpSync(
    join(server, "src/terminal/shell-integration"),
    join(daemonDir, "terminal/shell-integration"),
    { recursive: true },
  );
}

await stageNode();
await bundleDaemon();
console.log(`daemon runtime staged in ${runtime}`);
