import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const targetSrc = join(root, "packages/shared/src");
const sourceSrc = join(root, "../backend/packages/shared/src");

if (!existsSync(sourceSrc)) {
  console.error("Backend shared source not found at", sourceSrc);
  process.exit(1);
}

rmSync(targetSrc, { recursive: true, force: true });
cpSync(sourceSrc, targetSrc, { recursive: true });

console.log("Synced packages/shared/src from MkopoFlow backend.");
