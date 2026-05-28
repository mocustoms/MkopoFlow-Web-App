import { existsSync, mkdirSync, symlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const linked = join(root, "packages/shared");
const monorepoSource = join(root, "../backend/packages/shared");

// Committed copy (Railway/Docker) or existing link/copy
if (existsSync(join(linked, "package.json"))) {
  process.exit(0);
}

// Local monorepo: symlink backend shared for live edits
if (existsSync(join(monorepoSource, "package.json"))) {
  mkdirSync(join(root, "packages"), { recursive: true });
  symlinkSync(monorepoSource, linked, "dir");
  process.exit(0);
}

console.error(
  "Missing packages/shared. Run: pnpm sync:shared (from monorepo) or commit packages/shared.",
);
process.exit(1);
