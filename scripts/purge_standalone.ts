import fs from "node:fs";
import path from "node:path";

function getDirSizeBytes(dirPath: string): number {
  if (!fs.existsSync(dirPath)) return 0;
  let total = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) {
        total += getDirSizeBytes(fullPath);
      } else if (entry.isFile()) {
        total += fs.statSync(fullPath).size;
      }
    }
  } catch {
    // Ignore permission or transient read errors
  }
  return total;
}

function formatMB(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function removePathSafe(targetPath: string, label: string): number {
  if (!fs.existsSync(targetPath)) return 0;
  const stat = fs.statSync(targetPath);
  const bytes = stat.isDirectory() ? getDirSizeBytes(targetPath) : stat.size;
  try {
    fs.rmSync(targetPath, { recursive: true, force: true });
    console.log(`  [PURGED] ${label.padEnd(52)} (-${formatMB(bytes)})`);
    return bytes;
  } catch (err) {
    console.warn(`  [SKIP]   Could not remove ${label}: ${(err as Error).message}`);
    return 0;
  }
}

function stripNonRuntimeFilesInStandalone(dirPath: string): number {
  if (!fs.existsSync(dirPath)) return 0;
  let freed = 0;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isSymbolicLink()) continue;
    if (entry.isDirectory()) {
      freed += stripNonRuntimeFilesInStandalone(fullPath);
    } else if (entry.isFile()) {
      const lower = entry.name.toLowerCase();
      if (
        lower.endsWith(".d.ts") ||
        lower.endsWith(".d.mts") ||
        lower.endsWith(".js.map") ||
        lower.endsWith(".mjs.map") ||
        lower === "readme.md" ||
        lower === "changelog.md" ||
        lower === "history.md"
      ) {
        try {
          const size = fs.statSync(fullPath).size;
          fs.rmSync(fullPath, { force: true });
          freed += size;
        } catch {
          // Ignore
        }
      }
    }
  }
  return freed;
}

function main() {
  const root = process.cwd();
  const nodeModules = path.join(root, "node_modules");
  const standaloneModules = path.join(root, ".next", "standalone", "node_modules");

  console.log("=== 46Hz Standalone & node_modules Unused Package Purge ===");

  let totalFreed = 0;

  // 1. Purge unused Cloud / Composer / Studio / Cache bloat from root node_modules
  const rootTargets = [
    ".cache",
    path.join("@prisma", "composer", "node_modules"),
    path.join("@prisma", "composer-cli", "node_modules"),
    path.join("@prisma", "studio-core"),
    "workerd",
    "@alchemy.run",
    "eslint",
    "eslint-config-next",
    "eslint-plugin-react-hooks",
    "eslint-plugin-import",
    "eslint-plugin-jsx-a11y",
    "@eslint",
    "@eslint-community",
    "axe-core"
  ];

  for (const rel of rootTargets) {
    totalFreed += removePathSafe(path.join(nodeModules, rel), `node_modules/${rel.replace(/\\/g, "/")}`);
  }

  // Ensure a minimal 200-byte CJS stub exists for @prisma/studio-core so `prisma7 generate` CLI loads cleanly
  const studioCoreDir = path.join(nodeModules, "@prisma", "studio-core");
  fs.mkdirSync(studioCoreDir, { recursive: true });
  fs.writeFileSync(
    path.join(studioCoreDir, "package.json"),
    JSON.stringify(
      {
        name: "@prisma/studio-core",
        version: "0.0.0-stub",
        main: "./index.js",
        exports: {
          ".": "./index.js",
          "./*": "./index.js"
        }
      },
      null,
      2
    ),
    "utf-8"
  );
  fs.writeFileSync(path.join(studioCoreDir, "index.js"), "module.exports = {};\n", "utf-8");

  // 2. Purge stale legacy Prisma 6 native query-engine binaries in node_modules/.prisma/client
  //    (Prisma 7 uses query_compiler_fast_bg.wasm-base64.js + @prisma/adapter-pg)
  const dotPrismaClient = path.join(nodeModules, ".prisma", "client");
  if (fs.existsSync(dotPrismaClient)) {
    const files = fs.readdirSync(dotPrismaClient);
    for (const file of files) {
      if (file.startsWith("query-engine-") || file.startsWith("query_engine-")) {
        totalFreed += removePathSafe(
          path.join(dotPrismaClient, file),
          `node_modules/.prisma/client/${file}`
        );
      }
    }
  }

  // 3. Purge non-runtime sourcemaps/d.ts/docs from .next/standalone/node_modules
  if (fs.existsSync(standaloneModules)) {
    const standaloneFreed = stripNonRuntimeFilesInStandalone(standaloneModules);
    totalFreed += standaloneFreed;
    console.log(
      `  [PURGED] .next/standalone/node_modules (*.d.ts, *.map, docs) (-${formatMB(standaloneFreed)})`
    );
    const finalStandaloneSize = getDirSizeBytes(standaloneModules);
    console.log(`  [INFO]   Final .next/standalone/node_modules size: ${formatMB(finalStandaloneSize)}`);
  }

  console.log(`\nTotal Unused Bloat Purged: ${formatMB(totalFreed)}`);
}

main();
