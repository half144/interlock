import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import { defineConfig, type EnvironmentModuleNode, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// App-wide singletons: the store and the one daemon client. Hot-swapping either splits the window
// between two copies, so the UI waits on a store the live connection never writes to.
const SINGLETONS = ["/src/stores/app-store.ts", "/src/daemon/client.ts"];
const DELETE_SETTLE_MS = 400;

function reachesSingleton(changed: EnvironmentModuleNode[]): boolean {
  const seen = new Set<EnvironmentModuleNode>();
  const queue = [...changed];
  for (let mod = queue.shift(); mod; mod = queue.shift()) {
    if (seen.has(mod)) continue;
    seen.add(mod);
    if (SINGLETONS.some((path) => mod.file?.endsWith(path))) return true;
    queue.push(...mod.importers);
  }
  return false;
}

/** Component edits keep Fast Refresh; edits under the store or the daemon client, and deleted modules, reload the page. */
function reloadOnSingletonUpdate(): Plugin {
  let pending: ReturnType<typeof setTimeout> | undefined;
  return {
    name: "interlock:reload-on-singleton-update",
    hotUpdate({ type, modules }) {
      if (this.environment.name !== "client") return;
      if (type === "delete") {
        // A move deletes, then rewrites importers; reload once they settle.
        clearTimeout(pending);
        pending = setTimeout(() => {
          this.environment.hot.send({ type: "full-reload" });
        }, DELETE_SETTLE_MS);
        return [];
      }
      if (!reachesSingleton(modules)) return;
      this.environment.hot.send({ type: "full-reload" });
      return [];
    },
  };
}

const { version } = JSON.parse(
  readFileSync(new URL("./package.json", import.meta.url), "utf8"),
) as {
  version: string;
};

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss(), reloadOnSingletonUpdate()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  // A dev server outlives commits, so only a built app is pinned to one.
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __APP_BUILD__: JSON.stringify(
      command === "build" ? execSync("git rev-parse --short HEAD").toString().trim() : "dev",
    ),
  },
}));
