import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";
import { parseLauncherArgs } from "@/start";

describe("Arm64 Architecture Support", () => {
  it("includes required Arm64 and macOS binary targets in prisma schema", () => {
    const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
    const content = fs.readFileSync(schemaPath, "utf-8");

    expect(content).toContain("debian-openssl-3.0.x");
    expect(content).toContain("linux-arm64-openssl-3.0.x");
    expect(content).toContain("linux-arm64-openssl-1.1.x");
    expect(content).toContain("linux-musl-arm64-openssl-3.0.x");
    expect(content).toContain("darwin");
    expect(content).toContain("darwin-arm64");
    expect(content).toContain("native");
  });

  it("validates unified Node.js 26 start.ts launcher script and CLI argument parser", () => {
    const startTsPath = path.join(process.cwd(), "start.ts");
    expect(fs.existsSync(startTsPath)).toBe(true);
    expect(fs.existsSync(path.join(process.cwd(), "start.ps1"))).toBe(false);
    expect(fs.existsSync(path.join(process.cwd(), "start.sh"))).toBe(false);

    const content = fs.readFileSync(startTsPath, "utf-8");
    expect(content).toMatch(/^#!\/usr\/bin\/env -S node/);
    expect(content).toContain("os.platform()");
    expect(content).toContain("os.arch()");
    expect(content).toContain("46hz-postgres");
    expect(content).toContain("prisma:generate");
    expect(content).toContain("prisma:emit");

    const parsedPosix = parseLauncherArgs(["--verify-only", "--seed", "--port", "4000"]);
    expect(parsedPosix.verifyOnly).toBe(true);
    expect(parsedPosix.seed).toBe(true);
    expect(parsedPosix.port).toBe(4000);

    const parsedPwsh = parseLauncherArgs(["-VerifyOnly", "-Prod", "-Port", "8080"]);
    expect(parsedPwsh.verifyOnly).toBe(true);
    expect(parsedPwsh.prod).toBe(true);
    expect(parsedPwsh.port).toBe(8080);
  });

  it("package.json scripts avoid architecture-dependent binaries and use Prisma 8 contract emit", () => {
    const pkgPath = path.join(process.cwd(), "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

    expect(pkg.name).toBe("46hz");
    // Verification that scripts work with platform-agnostic tools and Prisma 8 contract emit
    expect(pkg.scripts.build).toContain("prisma contract emit");
    expect(pkg.scripts["prisma:emit"]).toBe("prisma contract emit");
    expect(pkg.scripts["launcher"]).toBe("node start.ts");
    expect(pkg.scripts["start:mac"]).toBe("node start.ts");
  });

  it("validates multi-architecture Dockerfile syntax and Node 26 base image", () => {
    const dockerfilePath = path.join(process.cwd(), "Dockerfile");
    const content = fs.readFileSync(dockerfilePath, "utf-8");

    expect(content).toMatch(/FROM node:(20|26)-bookworm-slim/);
    expect(content).toContain("openssl");
    expect(content).toMatch(/npx prisma contract emit/);
    // Ensure no invalid shell redirection / pipe syntax in COPY instructions
    const copyLines = content.split("\n").filter((l) => l.trim().startsWith("COPY"));
    for (const line of copyLines) {
      expect(line).not.toContain("2>/dev/null");
      expect(line).not.toContain("||");
    }
  });

  it("validates docker-compose multi-platform postgres configuration", () => {
    const composePath = path.join(process.cwd(), "docker-compose.yml");
    const content = fs.readFileSync(composePath, "utf-8");

    expect(content).toMatch(/postgres:(16|17|19)/);
    expect(content).toContain("46hz-letterbox-postgres");
  });

  it("validates pure Prisma 8 configuration and emitted contract", () => {
    const configPath = path.join(process.cwd(), "prisma.config.ts");
    expect(fs.existsSync(configPath)).toBe(true);
    const content = fs.readFileSync(configPath, "utf-8");
    expect(content).toContain("definePrismaConfig");
    expect(content).toContain("@prisma/orm-postgres/config");

    // Ensure legacy side-by-side config files have been purged
    const prisma7Config = path.join(process.cwd(), "prisma7.config.ts");
    const prisma8Config = path.join(process.cwd(), "prisma8.config.ts");
    expect(fs.existsSync(prisma7Config)).toBe(false);
    expect(fs.existsSync(prisma8Config)).toBe(false);

    const pkgPath = path.join(process.cwd(), "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    expect(pkg.devDependencies["prisma"]).toBe("8.0.0-rc.23");
    expect(pkg.devDependencies["@prisma/orm-postgres"]).toBe("8.0.0-rc.18");

    const contractJson = path.join(process.cwd(), "prisma", "contract.json");
    expect(fs.existsSync(contractJson)).toBe(true);
  });
});
