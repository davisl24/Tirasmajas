import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { resolve, sep, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const result = spawnSync(process.execPath, [join(root, "scripts/build.mjs")], { cwd: root, stdio: "inherit" });
if (result.status !== 0) process.exit(result.status || 1);

const dist = join(root, "dist");
const mime = { ".html":"text/html; charset=utf-8", ".css":"text/css; charset=utf-8", ".js":"text/javascript; charset=utf-8", ".json":"application/json", ".svg":"image/svg+xml", ".png":"image/png", ".webp":"image/webp", ".ico":"image/x-icon", ".xml":"application/xml", ".txt":"text/plain; charset=utf-8" };
const port = Number(process.env.PORT || 3000);
createServer((req,res) => {
  let path;
  try { path = decodeURIComponent(new URL(req.url, "http://localhost").pathname); }
  catch { res.writeHead(400).end("Bad request"); return; }
  const file = resolve(dist, "." + path, path.endsWith("/") ? "index.html" : "");
  if (file !== dist && !file.startsWith(dist + sep)) { res.writeHead(403).end("Forbidden"); return; }
  let target = file;
  if (existsSync(target) && statSync(target).isDirectory()) target = join(target, "index.html");
  if (!existsSync(target) || !statSync(target).isFile()) { res.writeHead(404).end("404 - Lapa nav atrasta"); return; }
  res.setHeader("Content-Type", mime[extname(target)] || "application/octet-stream");
  res.setHeader("Cache-Control", "no-store");
  res.end(readFileSync(target));
}).listen(port, () => console.log("Tīras Mājas demo: http://localhost:" + port + "/  (pēc izmaiņām restartē npm run dev)"));
