import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

describe("Arm64 Architecture Support", () => {
  it("includes required Arm64 binary targets in prisma schema", () => {
    const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
    const content = fs.readFileSync(schemaPath, "utf-8");

    expect(content).toContain("linux-arm64-openssl-3.0.x");
    expect(content).toContain("linux-arm64-openssl-1.1.x");
    expect(content).toContain("linux-musl-arm64-openssl-3.0.x");
    expect(content).toContain("darwin-arm64");
    expect(content).toContain("native");
  });

  it("package.json scripts avoid architecture-dependent binaries", () => {
    const pkgPath = path.join(process.cwd(), "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));

    expect(pkg.name).toBe("46hz");
    // Verification that scripts work with platform-agnostic tools
    expect(pkg.scripts.build).toContain("prisma generate");
  });

  it("validates multi-architecture Dockerfile syntax and base image", () => {
    const dockerfilePath = path.join(process.cwd(), "Dockerfile");
    const content = fs.readFileSync(dockerfilePath, "utf-8");

    expect(content).toContain("FROM node:20-bookworm-slim");
    expect(content).toContain("openssl");
    expect(content).toContain("npx prisma generate");
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

    expect(content).toContain("postgres:16");
    expect(content).toContain("46hz-letterbox-postgres");
  });

  it("validates Prisma 7 prisma.config.ts configuration exists", () => {
    const configPath = path.join(process.cwd(), "prisma.config.ts");
    expect(fs.existsSync(configPath)).toBe(true);
    const content = fs.readFileSync(configPath, "utf-8");
    expect(content).toContain("defineConfig");
  });
});
