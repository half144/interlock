import { fileURLToPath, URL } from "node:url";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const UNLINK_SETTLE_MS = 400;

// A deleted or moved module cannot be hot-swapped: the half-applied update leaves the window with a
// fresh store that never hears about the live daemon connection. Reload the page once the move settles.
function reloadOnUnlink(): Plugin {
  return {
    name: "interlock:reload-on-unlink",
    configureServer(server) {
      let timer: ReturnType<typeof setTimeout> | undefined;
      server.watcher.on("unlink", () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          server.environments.client.hot.send({ type: "full-reload" });
        }, UNLINK_SETTLE_MS);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), reloadOnUnlink()],
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
