import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(root, "packages/shared");
const source = join(root, "../backend/packages/shared");

if (!existsSync(join(source, "package.json"))) {
  console.error("Backend shared package not found at", source);
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });

for (const name of ["package.json", "tsconfig.json", "src"]) {
  cpSync(join(source, name), join(target, name), { recursive: true });
}

console.log("Synced packages/shared from MkopoFlow backend.");
