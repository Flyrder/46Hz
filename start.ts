#!/usr/bin/env -S node
/**
 * 46Hz Unified Cross-Platform Launcher (Node.js 26 Native TypeScript)
 * Replaces legacy start.ps1 (Windows PowerShell) and start.sh (macOS / Linux)
 * Supports Windows (x64/arm64), macOS (Apple Silicon arm64 & Intel x64), and Linux (x64/arm64).
 */

import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
process.chdir(ROOT_DIR);

const COLORS = {
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  gray: "\x1b[90m",
  reset: "\x1b[0m"
} as const;

export interface LauncherOptions {
  port: number;
  verify: boolean;
  verifyOnly: boolean;
  seed: boolean;
  prod: boolean;
  noStart: boolean;
  skipChecks: boolean;
  help: boolean;
}

export function parseLauncherArgs(argv: readonly string[]): LauncherOptions {
  const options: LauncherOptions = {
    port: Number(process.env.PORT) || 3000,
    verify: false,
    verifyOnly: false,
    seed: false,
    prod: false,
    noStart: false,
    skipChecks: false,
    help: false
  };

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]!;
    const lower = arg.toLowerCase();

    if (lower === "--verify" || lower === "-v" || lower === "-verify") {
      options.verify = true;
    } else if (lower === "--verify-only" || lower === "-verifyonly") {
      options.verifyOnly = true;
    } else if (lower === "--seed" || lower === "-s" || lower === "-seed") {
      options.seed = true;
    } else if (lower === "--prod" || lower === "-p" || lower === "-prod") {
      options.prod = true;
    } else if (lower === "--no-start" || lower === "-nostart") {
      options.noStart = true;
    } else if (lower === "--skip-checks" || lower === "-skipchecks") {
      options.skipChecks = true;
    } else if (lower === "--port" || lower === "-port") {
      const next = Number(argv[i + 1]);
      if (!Number.isInteger(next) || next < 1 || next > 65535) {
        throw new Error(`Invalid port value: ${argv[i + 1] ?? ""}`);
      }
      options.port = next;
      i++;
    } else if (lower.startsWith("--port=")) {
      const parsed = Number(arg.slice("--port=".length));
      if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
        throw new Error(`Invalid port value: ${arg}`);
      }
      options.port = parsed;
    } else if (lower === "--help" || lower === "-h" || lower === "-help") {
      options.help = true;
    } else {
      throw new Error(`Unknown option: ${arg}`);
    }
  }

  return options;
}

function printHelp(): void {
  console.log(`Usage: node start.ts [options]

Options:
  --verify, -v        Run backend and Vitest verification suites during startup
  --verify-only       Run verification suites and exit immediately
  --seed, -s          Seed database with crisis resources and sample letters
  --prod, -p          Build and launch production server instead of dev server
  --port <number>     Custom HTTP port (default: 3000)
  --no-start          Prepare database and Prisma 8 contract without starting server
  --skip-checks       Skip PostgreSQL port and container checks
  --help, -h          Show this help message`);
}

function checkPortOpen(host = "127.0.0.1", port = 5432, timeoutMs = 1500): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(ok);
    };

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

function commandExists(cmd: string): boolean {
  const pathEnv = process.env.PATH ?? "";
  const dirs = pathEnv.split(path.delimiter).filter(Boolean);
  const exts =
    process.platform === "win32" && !path.extname(cmd)
      ? (process.env.PATHEXT ?? ".EXE;.CMD;.BAT").split(";")
      : [""];

  for (const dir of dirs) {
    for (const ext of exts) {
      if (fs.existsSync(path.join(dir, `${cmd}${ext}`))) {
        return true;
      }
    }
  }
  return false;
}

function resolveContainerCli(): string | null {
  if (process.platform === "win32") {
    const wslcDefault = "C:\\Program Files\\WSL\\wslc.exe";
    if (fs.existsSync(wslcDefault)) return wslcDefault;
    if (commandExists("wslc.exe")) return "wslc.exe";
  }
  if (commandExists("docker")) return "docker";
  return null;
}

function checkContainerExists(cli: string, containerName = "46hz-postgres"): boolean {
  for (let attempt = 0; attempt < 3; attempt++) {
    // 1. inspect (fastest and exact in both Docker and WSLC)
    const inspect = spawnSync(cli, ["inspect", containerName], { encoding: "utf-8" });
    if (inspect.status === 0) return true;

    // 2. list -a / ps -a
    const list = spawnSync(cli, ["list", "-a"], { encoding: "utf-8" });
    if (list.status === 0 && (list.stdout ?? "").includes(containerName)) return true;

    const ps = spawnSync(cli, ["ps", "-a"], { encoding: "utf-8" });
    if (ps.status === 0 && (ps.stdout ?? "").includes(containerName)) return true;

    // When WSLC is waking up on a cold boot, briefly yield before retrying
    if (attempt < 2) {
      const wait = spawnSync("node", ["-e", "setTimeout(() => {}, 800)"]);
      void wait;
    }
  }
  return false;
}

function startPostgresContainer(cli: string): void {
  const label = cli.toLowerCase().includes("wslc") ? `WSLC (${cli})` : "Docker CLI";
  console.log(`${COLORS.cyan}[INFO] Managing 46hz-postgres container with ${label}...${COLORS.reset}`);

  const exists = checkContainerExists(cli, "46hz-postgres");

  if (exists) {
    console.log(`${COLORS.green}[INFO] Starting existing 46hz-postgres container...${COLORS.reset}`);
    const started = spawnSync(cli, ["start", "46hz-postgres"], { stdio: "inherit" });
    if (started.status === 0) {
      return;
    }
    console.log(`${COLORS.yellow}[WARN] Direct start failed. Retrying...${COLORS.reset}`);
  }

  const defaultImage = process.env.POSTGRES_IMAGE || "postgres:17-alpine";
  console.log(
    `${COLORS.green}[INFO] Creating and launching 46hz-postgres container (${defaultImage})...${COLORS.reset}`
  );
  const created = spawnSync(
    cli,
    [
      "run",
      "-d",
      "--name",
      "46hz-postgres",
      "-p",
      "127.0.0.1:5432:5432",
      "-e",
      "POSTGRES_USER=46hz",
      "-e",
      "POSTGRES_PASSWORD=46hz",
      "-e",
      "POSTGRES_DB=46hz_letterbox",
      "-v",
      "46hz_postgres_v17_data:/var/lib/postgresql/data",
      defaultImage
    ],
    { stdio: "inherit" }
  );

  if (created.status !== 0) {
    // If run failed (e.g. name conflict, already exists, or WSLC session race), attempt fallback start
    console.log(`${COLORS.yellow}[INFO] Fallback: attempting to start container 46hz-postgres...${COLORS.reset}`);
    const fallbackStart = spawnSync(cli, ["start", "46hz-postgres"], { stdio: "inherit" });
    if (fallbackStart.status !== 0) {
      throw new Error("Failed to create or start 46hz-postgres container.");
    }
  }
}

function runNodeBin(binRelativePath: string, args: string[] = []): boolean {
  const fullPath = path.join(ROOT_DIR, binRelativePath);
  const res = spawnSync(process.execPath, [fullPath, ...args], {
    stdio: "inherit",
    env: process.env
  });
  return res.status === 0;
}

function runNpmScript(scriptName: string, extraArgs: string[] = []): boolean {
  if (scriptName === "prisma:generate" || scriptName === "prisma:emit") {
    return runNodeBin("node_modules/prisma/dist/prisma.js", ["contract", "emit"]);
  }
  if (scriptName === "prisma:seed") {
    return runNodeBin("node_modules/tsx/dist/cli.mjs", ["prisma/seed.ts"]);
  }
  if (scriptName === "verify:backend") {
    return runNodeBin("node_modules/tsx/dist/cli.mjs", ["scripts/verify_backend.ts"]);
  }
  if (scriptName === "test:run") {
    return runNodeBin("node_modules/vitest/vitest.mjs", ["run"]);
  }
  if (scriptName === "build") {
    return (
      runNpmScript("prisma:emit") &&
      runNodeBin("node_modules/next/dist/bin/next", ["build", ...extraArgs])
    );
  }
  return runNodeBin("node_modules/next/dist/bin/next", [scriptName, ...extraArgs]);
}

async function ensurePostgresRunning(): Promise<void> {
  console.log("\n[1/4] Checking PostgreSQL database service (127.0.0.1:5432)...");
  if (await checkPortOpen("127.0.0.1", 5432)) {
    console.log(`${COLORS.green}[OK] PostgreSQL is active on 127.0.0.1:5432.${COLORS.reset}`);
    return;
  }

  console.log(`${COLORS.yellow}[INFO] Port 5432 is not responding. Checking container/service managers...${COLORS.reset}`);
  const containerCli = resolveContainerCli();

  if (containerCli) {
    startPostgresContainer(containerCli);
  } else if (process.platform === "darwin" && commandExists("brew")) {
    console.log(`${COLORS.cyan}[INFO] macOS Homebrew detected. Starting postgresql service...${COLORS.reset}`);
    spawnSync("brew", ["services", "start", "postgresql"], { stdio: "inherit" });
  } else {
    throw new Error(
      "Neither Docker/WSLC nor local PostgreSQL was found on port 5432. Please start PostgreSQL manually."
    );
  }

  console.log(`${COLORS.gray}[INFO] Waiting for PostgreSQL to accept connections...${COLORS.reset}`);
  for (let attempt = 1; attempt <= 20; attempt++) {
    await new Promise((r) => setTimeout(r, 1000));
    if (await checkPortOpen("127.0.0.1", 5432)) {
      console.log(`${COLORS.green}[OK] PostgreSQL is ready and accepting connections on port 5432.${COLORS.reset}`);
      return;
    }
  }

  throw new Error("Timed out waiting for PostgreSQL to accept connections on port 5432.");
}

async function main(): Promise<void> {
  const options = parseLauncherArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  console.log(`${COLORS.cyan}==========================================================${COLORS.reset}`);
  console.log(`${COLORS.cyan}             46Hz - 마음의 소리 익명 우체통               ${COLORS.reset}`);
  console.log(`${COLORS.cyan}          Human-Centered Heart Sound Letterbox            ${COLORS.reset}`);
  console.log(`${COLORS.cyan}==========================================================${COLORS.reset}`);
  console.log(
    `[INFO] Detected Platform: ${COLORS.green}${os.platform()}${COLORS.reset} (${os.arch()}) · Node ${process.version}`
  );

  // 1. Ensure .env exists
  const envPath = path.join(ROOT_DIR, ".env");
  const envExamplePath = path.join(ROOT_DIR, ".env.example");
  if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
    console.log(`${COLORS.yellow}[INFO] .env not found. Creating from .env.example...${COLORS.reset}`);
    fs.copyFileSync(envExamplePath, envPath);
  }

  // 2. Check PostgreSQL
  if (!options.skipChecks) {
    await ensurePostgresRunning();
  }

  // 3. Emit Prisma 8 contract & verify schema
  console.log("\n[2/4] Generating Prisma 8 Contract and verifying schema...");
  if (!runNpmScript("prisma:generate") && !runNpmScript("prisma:emit")) {
    throw new Error("Failed to emit Prisma 8 contract.");
  }

  if (options.seed) {
    console.log(`\n${COLORS.cyan}[SEED] Seeding database with initial data...${COLORS.reset}`);
    if (!runNpmScript("prisma:seed")) {
      throw new Error("Database seeding failed.");
    }
  }

  // 4. Optional verification suite
  if (options.verify || options.verifyOnly) {
    console.log(`\n${COLORS.cyan}[VERIFY] Running backend integrity suite (verify:backend)...${COLORS.reset}`);
    if (!runNpmScript("verify:backend")) {
      throw new Error("Backend verification failed.");
    }

    console.log(`\n${COLORS.cyan}[VERIFY] Running automated test suite (test:run)...${COLORS.reset}`);
    if (!runNpmScript("test:run")) {
      throw new Error("Vitest verification failed.");
    }

    if (options.verifyOnly) {
      console.log(`\n${COLORS.green}[SUCCESS] All checks and verifications passed!${COLORS.reset}`);
      return;
    }
  }

  if (options.noStart) {
    console.log(`\n${COLORS.green}[OK] Environment initialized. Exiting (--no-start).${COLORS.reset}`);
    return;
  }

  // 5. Launch Next.js Server
  console.log("\n[3/4] Preparing application startup...");
  console.log(`${COLORS.gray}----------------------------------------------------------${COLORS.reset}`);
  console.log(`  Web App:       ${COLORS.green}http://localhost:${options.port}${COLORS.reset}`);
  console.log(`  Admin Portal:  ${COLORS.green}http://localhost:${options.port}/admin${COLORS.reset}`);
  console.log(`  Default Lang:  ${COLORS.gray}ko_KR (Korean First)${COLORS.reset}`);
  console.log(`${COLORS.gray}----------------------------------------------------------${COLORS.reset}`);

  process.env.PORT = String(options.port);
  const nextBin = path.join(ROOT_DIR, "node_modules/next/dist/bin/next");

  if (options.prod) {
    console.log(`\n${COLORS.cyan}[4/4] Building & launching Next.js Production Server on port ${options.port}...${COLORS.reset}`);
    if (!runNpmScript("build")) {
      throw new Error("Production build failed.");
    }
    const child = spawn(process.execPath, [nextBin, "start", "-p", String(options.port)], {
      stdio: "inherit",
      env: process.env
    });
    child.on("exit", (code) => process.exit(code ?? 0));
  } else {
    console.log(`\n${COLORS.cyan}[4/4] Launching Next.js Dev Server on port ${options.port}...${COLORS.reset}`);
    const child = spawn(process.execPath, [nextBin, "dev", "-p", String(options.port)], {
      stdio: "inherit",
      env: process.env
    });
    child.on("exit", (code) => process.exit(code ?? 0));
  }
}

const isDirectExecution =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  main().catch((err) => {
    console.error(`${COLORS.red}[ERROR] ${err instanceof Error ? err.message : String(err)}${COLORS.reset}`);
    process.exit(1);
  });
}
