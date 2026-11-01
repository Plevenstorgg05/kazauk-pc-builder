/** Serve the export with the same project prefix and directory URLs as GitHub Pages. */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("../out/", import.meta.url)));
const basePath = process.env.PAGES_BASE_PATH ?? "/kazauk-pc-builder";
const port = Number(process.env.PORT ?? "3001");
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".txt": "text/plain", ".jpg": "image/jpeg", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    if (url.pathname === basePath && basePath) {
      response.writeHead(301, { Location: `${basePath}/${url.search}` }).end();
      return;
    }
    if (basePath && !url.pathname.startsWith(`${basePath}/`)) throw new Error("Outside project");
    const relative = decodeURIComponent(url.pathname.slice(basePath.length));
    let file = path.resolve(root, `.${relative}`);
    if (file !== root && !file.startsWith(`${root}${path.sep}`)) throw new Error("Outside export");
    if ((await stat(file)).isDirectory()) {
      if (!url.pathname.endsWith("/")) {
        response.writeHead(301, { Location: `${url.pathname}/${url.search}` }).end();
        return;
      }
      file = path.join(file, "index.html");
    }
    const content = await readFile(file);
    response.writeHead(200, { "Content-Type": types[path.extname(file)] ?? "application/octet-stream" });
    response.end(request.method === "HEAD" ? undefined : content);
  } catch {
    response.writeHead(404, { "Content-Type": "text/html" });
    response.end(await readFile(path.join(root, "404.html")));
  }
}).listen(port, "127.0.0.1", () => console.log(`GitHub Pages preview: http://localhost:${port}${basePath}/`));
