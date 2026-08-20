import react from "@vitejs/plugin-react";
import fs from "node:fs/promises";
import path from "node:path";
import { defineConfig, type Plugin } from "vite";
import { staticRoutePaths } from "./demo/route-paths";

/**
 * GitHub Pages has no rewrite/SPA-fallback configuration, so a deep link such
 * as `/calendar/week` must resolve to a real file. This plugin copies the built
 * `index.html` shell to:
 *
 *   - `<route>.html` for every statically known route, so GitHub Pages answers
 *     those extensionless URLs with a 200 instead of a 404.
 *   - `404.html`, the only catch-all hook GitHub Pages exposes, so unknown or
 *     future client-side routes still boot the SPA (served with a 404 status)
 *     and let TanStack Router render the right screen.
 */
function githubPagesSpaFallback(): Plugin {
  let outDir = "dist";

  return {
    name: "github-pages-spa-fallback",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    async closeBundle() {
      const shell = await fs.readFile(path.join(outDir, "index.html"), "utf8");

      const targets = new Set(["404.html"]);
      for (const routePath of staticRoutePaths) {
        const trimmed = routePath.replace(/^\/+|\/+$/g, "");
        if (trimmed) targets.add(`${trimmed}.html`);
      }

      await Promise.all(
        [...targets].map(async (target) => {
          const file = path.join(outDir, target);
          await fs.mkdir(path.dirname(file), { recursive: true });
          await fs.writeFile(file, shell);
        }),
      );

      this.info(`emitted SPA entry points: ${[...targets].sort().join(", ")}`);
    },
  };
}

export default defineConfig({
  plugins: [react(), githubPagesSpaFallback()],
  root: "demo",
  build: {
    outDir: "../demo-dist",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
