/** Build an isolated GitHub Pages export without changing the approved app config. */
import { cp, mkdtemp, readFile, readdir, rm, symlink, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const basePath = process.env.PAGES_BASE_PATH ?? "/kazauk-pc-builder";
if (basePath && !/^\/[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*$/.test(basePath))
  throw new Error("PAGES_BASE_PATH must be empty or an absolute path without a trailing slash.");

const stage = await mkdtemp(path.join(tmpdir(), "kazauk-pages-"));
const output = path.join(root, "out");
try {
  for (const name of ["app", "components", "hooks", "lib", "data", "package.json", "package-lock.json", "tsconfig.json", "next-env.d.ts", "postcss.config.mjs"])
    await cp(path.join(root, name), path.join(stage, name), { recursive: true });
  await cp(path.join(root, "public"), path.join(stage, "public"), {
    recursive: true,
    // Original licensed source downloads are not runtime assets or part of the repository.
    filter: (source) => !source.startsWith(path.join(root, "public/models/source")),
  });
  await symlink(path.join(root, "node_modules"), path.join(stage, "node_modules"), "dir");
  const config = await readFile(path.join(root, "next.config.ts"), "utf8");
  const exportStatement = "export default nextConfig;";
  if (!config.includes(exportStatement)) throw new Error("Review the Pages config adapter after changing next.config.ts.");
  await writeFile(path.join(stage, "next.config.ts"), config.replace(exportStatement, `export default {
    ...nextConfig,
    output: "export",
    basePath: ${JSON.stringify(basePath)},
    trailingSlash: true,
    images: { ...nextConfig.images, unoptimized: true },
  };`));
  // Webpack supports the isolated checkout's shared dependency symlink on Linux and macOS.
  const build = spawnSync(process.execPath, [path.join(root, "node_modules/next/dist/bin/next"), "build", "--webpack"], {
    cwd: stage,
    stdio: "inherit",
    env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
  if (build.status !== 0) throw new Error(`Static export failed (${build.status ?? build.error}).`);

  // Next prefixes routes/framework assets. Root-relative public URLs also need relocation
  // on project Pages. Change only emitted URL prefixes, never source, frames, or animation logic.
  let relocated = 0;
  async function relocate(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) await relocate(file);
      else if (/\.(?:html|js|css|json|txt)$/.test(entry.name)) {
        const content = await readFile(file, "utf8");
        const next = content.replace(/(["'`(])\/(products|ionz_frames|textures|models|images)\//g, (_, quote, folder) => {
          relocated++;
          return `${quote}${basePath}/${folder}/`;
        });
        if (content !== next) await writeFile(file, next);
      }
    }
  }
  if (basePath) await relocate(path.join(stage, "out"));
  await writeFile(path.join(stage, "out/.nojekyll"), "");
  await rm(output, { recursive: true, force: true });
  await cp(path.join(stage, "out"), output, { recursive: true });
  console.log(`GitHub Pages export: ${output}; base path: ${basePath || "/"}; public URL references relocated: ${relocated}.`);
} finally {
  await rm(stage, { recursive: true, force: true });
}
