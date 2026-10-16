---
description: 46Hz Engineering, Prisma 7+8 Coexistence, Standalone Purge, and UI/UX Governance
---

# 46Hz Engineering & Architecture Invariants

## 1. Prisma 7 + Prisma 8 RC Coexistence & Standalone Purge
- Use `npx prisma7 generate` for Prisma 7 (`prisma7.config.ts`) and `npm run prisma8:contract` (`npx prisma contract emit --config prisma8.config.ts`) for Prisma 8 RC (`@prisma/orm-postgres` `defineConfig` with `contract: "./prisma/contract.json"`).
- After installing dependencies or running `npm run build`, always run `npm run purge:modules` (`scripts/purge_standalone.ts`) to strip non-runtime `@prisma/composer*`, `workerd`, `@prisma/studio-core` (leaving the 200-byte CJS stub for `prisma7` CLI compatibility), and legacy `query-engine-*` binaries (~2.23 GB) from `node_modules` and `.next/standalone/node_modules`.

## 2. Unified System Settings (`settings.ts` & `/admin/settings`)
- Never hardcode system constants (Schumann reply caps, 15-min lease window, rate limits, default locale/theme, AI models) in route handlers or components. Always read from `settings.ts` and hydrate via `ensureSettingsLoadedFromDisk()` in `lib/settings-store.ts`.

## 3. Modern CSS & KWCAG 2.2 Accessibility
- Entry animations must use `.animate-entry` (`@starting-style` + separate `transition-behavior: allow-discrete` + `@media (prefers-reduced-motion: reduce)`).
- Validated form inputs must use `.validated-field` (`:user-invalid` / `:user-valid`) paired with a JS handler that synchronizes `aria-invalid="true"` and `.user-invalid-fallback`.
- All UI copy must be registered in `lib/i18n/types.ts` and mirrored across `locales/ko_KR.ts`, `locales/en_US.ts`, and `locales/zh_CN.ts`.
- Maintain the warm, dignified, and gentle "해요체" tone in Korean copywriting.
- Every interactive control must have a minimum bounding box of 44×44px (`min-h-[44px]`).

## 4. Crisis Resource & Privacy Boundaries
- Hotlines are strictly restricted to Republic of Korea (109, 1393, 1577-0199, 1388, 1588-9191) and Mainland China (400-161-9995, 12355, 010-82951332).

## 5. Git Commit Signing
- Always commit with `106471753+Flyrder@users.noreply.github.com` and SSH signature (`git commit -S`).
