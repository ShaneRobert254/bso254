import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const destDir = join(root, ".vercel/output/functions/__server.func/_libs");
const srcDir = join(root, "node_modules/@electric-sql/pglite/dist");
const files = ["pglite.data", "pglite.wasm", "initdb.wasm"];

if (!existsSync(destDir)) {
  console.log("[pglite] no Vercel function output, skipping");
  process.exit(0);
}

for (const name of files) {
  copyFileSync(join(srcDir, name), join(destDir, name));
  console.log("[pglite] bundled", name);
}
