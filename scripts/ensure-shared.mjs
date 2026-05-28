import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync, symlinkSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const linked = join(root, "packages/shared");
const monorepoSource = join(root, "../backend/packages/shared");

if (existsSync(linked)) {
  process.exit(0);
}

if (existsSync(monorepoSource)) {
  mkdirSync(join(root, "packages"), { recursive: true });
  symlinkSync(monorepoSource, linked, "dir");
  process.exit(0);
}

const onRailway =
  process.env.RAILWAY === "true" ||
  process.env.RAILWAY_ENVIRONMENT !== undefined ||
  process.env.CI === "true";

if (onRailway) {
  const token = process.env.GITHUB_TOKEN?.trim();
  const repo =
    process.env.MKOPOFLOW_BACKEND_REPO?.trim() ??
    "https://github.com/mocustoms/MkopoFlow-Backend.git";
  const cloneUrl = token
    ? repo.replace(/^https:\/\//, `https://${token}@`)
    : repo;
  const tmp = join(root, ".tmp-backend-clone");

  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(dirname(tmp), { recursive: true });

  execSync(
    `git clone --depth 1 --filter=blob:none --sparse ${JSON.stringify(cloneUrl)} ${JSON.stringify(tmp)}`,
    { stdio: "inherit" },
  );
  execSync("git sparse-checkout set packages/shared", {
    cwd: tmp,
    stdio: "inherit",
  });
  mkdirSync(join(root, "packages"), { recursive: true });
  cpSync(join(tmp, "packages/shared"), linked, { recursive: true });
  rmSync(tmp, { recursive: true, force: true });
  process.exit(0);
}

console.error(
  [
    "Missing @mkopoflow/shared.",
    "Run from the MkopoFlow monorepo, or set packages/shared before install.",
    "On Railway, ensure git is available and MkopoFlow-Backend is reachable",
    "(set GITHUB_TOKEN if the backend repo is private).",
  ].join(" "),
);
process.exit(1);
