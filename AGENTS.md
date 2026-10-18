# 46Hz Project Rules & Agent Guidelines

## 1. Project Documentation & Privacy Guardrails (CRITICAL)
- **External Documentation Location**: To protect sensitive IP, proprietary architecture, and business strategies, all project manuals and documentation are stored outside of this Git repository at:
  - **Path**: `C:\Users\voide\OneDrive\Documents\docs` (URI: `file:///C:/Users/voide/OneDrive/Documents/docs`)
- **Strict Privacy Invariant**:
  - **DO NOT** copy, paste, or commit documentation files from `C:\Users\voide\OneDrive\Documents\docs` into this Git repository.
  - **DO NOT** expose proprietary business, monetization, or unpublished trademark data in public commits, issues, or release notes.
  - Whenever an agent needs context on system architecture, UI/UX design, AI behavior, or feature specifications, read directly from `C:\Users\voide\OneDrive\Documents\docs`.

### Documentation Index
1. **`46hz_ai_intelligence_system.md`**:
   - Pluggable multi-provider LLM engine (`AiMiddleware`, OpenAI, Gemini, DeepSeek, Anthropic, Ollama, Custom, Mock).
   - Offline zero-breakage deterministic fallback (`MockAiMiddleware`).
   - Writing Sparks Helper, reply scaffolding, and prompt safety boundaries.
2. **`46hz_arm64_and_architecture.md`**:
   - Modern Next.js App Router standalone build on ARM64 Linux / Docker.
   - Pure Prisma 8 architecture and post-build non-runtime module purge.
3. **`46hz_complete_features_manual.md`**:
   - Core letterbox lifecycle (anonymous letters, replies, delivery delay, lease windows).
   - Real-time crisis detection and hotline redirection protocols.
   - Ambient soundscape player and emotional resonance features.
4. **`46hz_monetization_and_trademark_strategy.md`**:
   - 46Hz LLC SaaS monetization models and Open-Core protocol boundaries.
   - Trademark portfolio (`HumanityIntelligence™`, `HiPlus™`, etc.).
5. **`46hz_ui_design_system.md`**:
   - Warm paper aesthetic, Calm Technology principles, typography, and color tokens.
   - Modern CSS baseline (`@starting-style`, `transition-behavior: allow-discrete`, `:user-valid` / `:user-invalid`).
   - KWCAG 2.2 accessibility (44×44px touch targets, ARIA live regions, high contrast).

---

## 2. Engineering & Architecture Invariants
- **Pure Prisma 8**: Use `npm run prisma:emit` (`npx prisma contract emit`) for Prisma 8 (`prisma.config.ts`) with `@prisma/orm-postgres`. Prisma 7 dependencies are strictly purged.
- **Standalone Purge**: After installing dependencies or running `npm run build`, always run `npm run purge:modules` (`scripts/purge_standalone.ts`) to strip non-runtime packages (`@prisma/composer*`, `workerd`, etc.).
- **Unified System Settings**: Never hardcode system constants (rate limits, reply caps, AI models, leases) in components or routes. Read from `settings.ts` hydrated via `ensureSettingsLoadedFromDisk()` in `lib/settings-store.ts`.

---

## 3. UI/UX, Accessibility & Copywriting
- **Modern CSS**: Entry animations use `.animate-entry` with `@starting-style` and reduced-motion fallback.
- **Form Validation**: Validated inputs use `.validated-field` with `:user-valid` / `:user-invalid` and ARIA synchronization.
- **KWCAG 2.2 Minimum Target**: All interactive controls must be at least 44×44px (`min-h-[44px]`).
- **Tone & Copywriting**: Maintain the warm, dignified, and gentle "해요체" tone in Korean. Synchronize all strings across `locales/ko_KR.ts`, `locales/en_US.ts`, and `locales/zh_CN.ts` via `lib/i18n/types.ts`.

---

## 4. Crisis Resource & Geographic Boundaries
- Hotlines are strictly restricted to Republic of Korea (109, 1393, 1577-0199, 1388, 1588-9191) and Mainland China (400-161-9995, 12355, 010-82951332).

---

## 5. Git Commit Signing
- Commit with `106471753+Flyrder@users.noreply.github.com` and SSH signature (`git commit -S`).
