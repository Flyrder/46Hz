import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

describe("Arm64 Architecture Support", () => {
  it("includes required Arm64 and macOS binary targets in prisma schema", () => {
    const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
    const content = fs.readFileSync(schemaPath, "utf-8");

    expect(content).toContain("linux-arm64-openssl-3.0.x");
    expect(content).toContain("linux-arm64-openssl-1.1.x");
    expect(content).toContain("linux-musl-arm64-openssl-3.0.x");
    expect(content).toContain("darwin");
    expect(content).toContain("darwin-arm64");
    expect(content).toContain("native");
  });

  it("validates macOS and POSIX start.sh launcher script", () => {
    const startShPath = path.join(process.cwd(), "start.sh");
    expect(fs.existsSync(startShPath)).toBe(true);

    const content = fs.readFileSync(startShPath, "utf-8");
    expect(content).toMatch(/^#!\/usr\/bin\/env bash/);
    expect(content).toContain("uname -s");
    expect(content).toContain("46hz-postgres");
    expect(content).toContain("prisma:generate");
    expect(content).toContain("prisma:migrate");
  });

  it("package.json scripts avoid architecture-dependent binaries", () => {
    const pkgPath = path.join(process.cwd(), "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

    expect(pkg.name).toBe("46hz");
    // Verification that scripts work with platform-agnostic tools and Prisma generation
    expect(pkg.scripts.build).toMatch(/prisma(7)? generate/);
    expect(pkg.scripts["start:mac"]).toBe("./start.sh");
  });

  it("validates multi-architecture Dockerfile syntax and Node 26 base image", () => {
    const dockerfilePath = path.join(process.cwd(), "Dockerfile");
    const content = fs.readFileSync(dockerfilePath, "utf-8");

    expect(content).toMatch(/FROM node:(20|26)-bookworm-slim/);
    expect(content).toContain("openssl");
    expect(content).toMatch(/npx prisma(7)? generate/);
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

    expect(content).toMatch(/postgres:(16|19)/);
    expect(content).toContain("46hz-letterbox-postgres");
  });

  it("validates Prisma configuration and Prisma 8 RC contract", () => {
    const configPath = path.join(process.cwd(), "prisma.config.ts");
    expect(fs.existsSync(configPath)).toBe(true);
    const content = fs.readFileSync(configPath, "utf-8");
    expect(content).toContain("defineConfig");

    const prisma8Config = path.join(process.cwd(), "prisma8.config.ts");
    expect(fs.existsSync(prisma8Config)).toBe(true);
    const prisma8Content = fs.readFileSync(prisma8Config, "utf-8");
    expect(prisma8Content).toContain('from "prisma/config"');
    expect(prisma8Content).toContain('from "@prisma/orm-postgres/config"');

    const pkgPath = path.join(process.cwd(), "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    expect(pkg.devDependencies["prisma"]).toBe("8.0.0-rc.23");
    expect(pkg.devDependencies["@prisma/orm-postgres"]).toBe("8.0.0-rc.18");

    const contractPath = path.join(process.cwd(), "prisma", "contract.prisma");
    expect(fs.existsSync(contractPath)).toBe(true);
  });
});

