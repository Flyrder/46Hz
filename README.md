# 46Hz Letterbox

<div align="center">

**A quiet, human-centered anonymous emotional support slow letterbox.**

[![Next.js 16.4](https://img.shields.io/badge/Next.js-16.4-black.svg?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.x%20Strict-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma ORM 7](https://img.shields.io/badge/Prisma-7.10%20pg--adapter-2D3748.svg?logo=prisma)](https://www.prisma.io/)
[![Vitest](https://img.shields.io/badge/Vitest-113%20Passed-6E9F18.svg?logo=vitest)](https://vitest.dev/)
[![Multi-Arch](https://img.shields.io/badge/Arch-Arm64%20%7C%20AMD64-orange.svg?logo=docker)](https://www.docker.com/)
[![KWCAG 2.2](https://img.shields.io/badge/A11y-KWCAG%202.2%20%2F%20KS%20X%209256-emerald.svg)](#7-barrier-free-accessibility-kwcag-22)
[![Zero PII](https://img.shields.io/badge/Privacy-Zero%20PII%20GDPR-teal.svg)](#security-hardening--compliance)

</div>

---

## Brand Philosophy: The 46Hz Slow Loop

46Hz is inspired by Earth's **7th Schumann resonance mode** (~45.9Hz ≈ 46Hz). In the natural Earth-ionosphere spherical cavity, the electromagnetic resonant frequencies are not a simple arithmetic integer series ($7.83 \times n$), nor do they match an idealized zero-loss conductor ($f_n = \frac{c}{2\pi a}\sqrt{n(n+1)}$). Due to the finite electrical conductivity and damping of the ionospheric D-layer, ELF ground observations record real-world resonant peaks at:
- **1st Mode (Fundamental)**: ~7.83 Hz
- **2nd Mode**: ~14.3 Hz
- **3rd Mode**: ~20.8 Hz
- **4th Mode**: ~27.3 Hz
- **5th Mode**: ~33.8 Hz
- **6th Mode**: ~39.0 Hz
- **7th Mode**: **~45.9 Hz (~46 Hz)**

46Hz is the empirical 7th harmonic mode of our planet. Just as the planetary cavity dampens electromagnetic turbulence into steady, calming standing waves, 46Hz creates an intentional, unhurried space for vulnerable human thoughts.

```mermaid
flowchart LR
    A["비공개 작성<br/>(Write Privately)"] --> B["AI 익명화 & 탈민감화<br/>(AI Anonymize)"]
    B --> C["작성자 검토 & 수정<br/>(Author Review)"]
    C --> D["운영자 검토<br/>(Moderation)"]
    D --> E["또래 답장 작성<br/>(Peer Reply)"]
    E --> F["AI 답장 코칭<br/>(AI Reply Coach)"]
    F --> G["운영자 검토<br/>(Moderation)"]
    G --> H["답장 수신 & 공명<br/>(Receive & Resonate)"]
    H --> I["온화한 피드백<br/>(Warm Feedback)"]
```

> [!NOTE]
> 46Hz is **not** a clinic, diagnostic tool, or emergency crisis chat. AI acts strictly as an editable, transparent middleware layer between people. Letters in immediate crisis are safely redirected to 24/7 dedicated professional helplines.

---

## Key Features

### 1. 46Hz Schumann Resonance Harmonic Cap
- **7-Reply Cap by Default**: To prevent emotional overwhelm and advice flooding, every letter is limited to **at most 7 replies**.
- **Conscious Expansion to 15**: Only when the letter author feels ready for deeper connection can they explicitly click the expansion action (`더 깊은 공명 열기`) on their letter page, expanding capacity to 15 replies.
- **Graceful Closure**: Once the cap is reached, the letter is gently closed to new replies and filtered out of the peer pool.

### 2. Human-Centered Physical Letterbox Holding (Anti-Shadowban Design)
- **15-Minute Focused Writing Window**: When a peer begins drafting a response, the letter is quietly held for 15 minutes to prevent collision with other responders.
- **Physical Letterbox Metaphor**: Instead of alarming "Locked" or "Warning" alerts, peers see: *"Another peer is currently reading and thoughtfully writing a reply..."*
- **Voluntary Release**: Responders can click *"Put back in letterbox"* at any time to return the letter to the pool for others.

### 3. Quiet Stationery Aesthetic & Midnight Dark Mode
- **Warm Stationery Paper Textures**: Subtle stone and parchment backgrounds (`#FAF7F2`), delicate card borders, comfortable typography (`leading-relaxed`), and real-time character pacing.
- **Midnight Dark Mode**: Deep calming slate (`#0F131A` / `hsl(222 24% 8%)`) designed to comfort fatigued eyes without harsh pitch-black contrast.
- **Emotional Reflection Sparks**: Gentle prompt chips helping writers begin their letters without pressure.

### 4. Pluggable AI Middleware (`AiMiddleware`)
- **Default Offline Mock (`MockAiMiddleware`)**: Zero external API dependencies; runs completely offline and deterministically with realistic simulated latency.
- **Hot-Swappable Production LLM (`LlmAiMiddleware`)**: Supports `openai`, `deepseek` (with automated `<think>...</think>` reasoning tag stripping and enum sanitization), and `custom` OpenAI-compatible endpoints.
- **Resilient Fallback**: Automatically falls back to Mock upon upstream timeout or network degradation.

### 5. Author Control: Letter Deletion, Draft Comparison (Diff) & Passage Comments
- **Original vs Processed Comparison (Diff)**: In the review screen (`/write/review`) and letter detail (`/letters/[id]`), authors can compare their raw writing against the AI-anonymized draft side-by-side or tabbed, confirming private details were shielded before confirming.
- **Interactive Passage Commenting**: After submitting a letter, authors can highlight or select specific sentences or passages in `/letters/[id]` to attach personal reflections, emotional notes, and marginalia. Commented passages are visually highlighted with soft warm accents, creating a living reflective journal alongside peer replies.
- **Permanent Sovereign Letter Deletion**: Authors can permanently delete their letters at any time with accessible confirmation modals, cleanly cascading across all associated replies, matches, and feedback while releasing any in-progress reply leases.

### 6. Zero PII & Crockford Base32 Device Migration
- **No Email/Password Database Accounts**: True anonymity with zero personal data collected.
- **Crockford Base32 Migration Codes**: Cross-device transfer using typo-safe codes (e.g. `46HZ-XXXX-XXXX`), excluding confusing characters (`0`, `1`, `I`, `O`).

### 7. Granular Dual-Role Admin RBAC
- **Admin (`ADMIN_PASSCODE`)**: Full access, including user suspensions, crisis resource management, and compliance exports.
- **Moderator (`MODERATOR_PASSCODE`)**: Dedicated to content safety—reviewing letters and replies, reading reports, and inspecting audit logs.

### 8. Barrier-Free Accessibility (KWCAG 2.2)
46Hz is fully engineered in accordance with **KWCAG 2.2 (한국형 웹 콘텐츠 접근성 지침 2.2 / 국가표준 KS X 9256:2024)** and W3C WCAG 2.2 AA standards:

1. **인식의 용이성 (Perceivability)**:
   - **텍스트 명도 대비**: 일반 텍스트 최소 4.5:1 이상 고대비 준수 (본문 기본 대비 12.3:1, 다크 모드 14.8:1로 AAA 수준 충족).
   - **대체 텍스트**: 모든 시각적 인포그래픽 및 SVG 아이콘에 명시적 `aria-hidden="true"` 또는 의미 있는 대체 텍스트 제공.
   - **색상 독립성**: 모든 상태 표시는 색상뿐 아니라 텍스트 배지(승인됨, 검토 대기, 주의 필요 등)를 병기하여 색약자도 즉시 식별 가능.

2. **운용의 용이성 (Operability)**:
   - **키보드 완전 제어**: 마우스 없이 Tab 및 방향키로 모든 기능 조작 가능, 명확한 고대비 포커스 링(`focus-visible`) 표시 및 초점 트랩 방지.
   - **본문 바로가기 링크 (Skip Navigation)**: 첫 탭 시 화면 좌측 상단에 노출되는 `#main-content` 건너뛰기 링크 제공.
   - **최소 조작 영역 크기**: 모바일 터치 및 마우스 조작 오동작을 방지하기 위해 모든 버튼, 링크, 입력창에 **44px × 44px 이상** 크기 확보 (`min-h-[44px]`).
   - **충분한 시간 제공**: 15분 답장 작성 점유 창을 제공하며, 작성을 포기할 경우 즉시 편지를 돌려놓는 자발적 반환(`공명 양보하기`) 메커니즘 제공.

3. **이해의 용이성 (Understandability)**:
   - **기본 언어 선언**: 최상단 HTML 태그에 `<html lang="ko-KR">` 명시 (언어 설정 변경 시 실시간 반영).
   - **예측 가능한 서식**: 모든 폼 컨트롤에 `<label htmlFor="...">` 명시적 연결 및 에러 발생 시 `aria-invalid="true"`, `role="alert"` 즉시 공지.
   - **논리적 선형 구조**: 화면 낭독기가 위에서 아래로 혼선 없이 문맥을 이해할 수 있는 단일 방향 레이아웃.

4. **견고성 (Robustness)**:
   - **WAI-ARIA 1.2 시맨틱 랜드마크**: `role="banner"`, `role="navigation"`, `role="main"`, `role="contentinfo"`, `role="progressbar"` 등 랜드마크 구조화.
   - **스크린리더 완벽 호환**: Android TalkBack, iOS VoiceOver, 센스리더, NVDA, Windows Narrator 등 모든 스크린리더에서 자연스러운 음성 안내 지원.
   - **실시간 라이브 리전**: 글자 수 카운터 및 슈만 공명 노드 변경 사항을 스크린리더에 방해 없이 알리는 `aria-live="polite"` 적용.

---

## Unified Configuration (`settings.ts`)

All application settings are centralized in [settings.ts](./settings.ts) as a single source of truth:

```typescript
import { settings } from "@/settings";

// Brand & Metadata
settings.brand.name;               // "46Hz"
settings.brand.tagline;            // "A quiet anonymous emotional support letterbox."

// Resonance & Harmonics
settings.resonance.defaultMaxReplies;   // 7 (7th Schumann Harmonic)
settings.resonance.expandedMaxReplies;  // 15 (Expanded Harmonic)

// Concurrency Holding
settings.claiming.leaseDurationMinutes; // 15 minutes

// Law Enforcement & Compliance
settings.compliance.ipRetentionDays;    // 14 days rolling auto-purge
settings.compliance.maxRecentIps;       // 5 entries max
```

---

## Project Structure

```
46hz/
├── app/                          # Next.js App Router (React 19.3)
│   ├── actions/                  # Server Actions (letters, replies, admin, feedback, onboarding)
│   ├── admin/                    # Admin portal (dashboard, letters, replies, reports, users, resources)
│   ├── api/                      # Public API routes (health check, AI proxy endpoints)
│   ├── inbox/                    # User inbox (received letters & sent replies)
│   ├── letters/[id]/             # Letter detail, Schumann meter & feedback
│   ├── onboarding/               # Anonymous session creation & migration code restore
│   ├── reply/                    # Peer reply pool & reply workbench ([letterId])
│   ├── settings/                 # Profile, migration code export, theme, language
│   ├── support-resources/        # Emergency mental health crisis resources
│   ├── write/                    # Letter writing & review
│   ├── globals.css               # Design tokens, stationery styles, midnight dark mode
│   └── layout.tsx                # Root layout with AppShell wrapper
├── components/                   # Reusable UI components & layouts
│   ├── ui/                       # Accessible buttons & form primitives
│   ├── app-shell.tsx             # Barrier-free header, navigation & footer
│   ├── letter-card.tsx           # Stationery postcard card with status pills
│   ├── letter-editor.tsx         # Interactive lined stationery writing workbench
│   ├── preference-form.tsx       # Compact sliding pill & full theme/locale controls
│   ├── reply-composer.tsx        # AI Reply Coach interactive workbench
│   └── resonance-meter.tsx       # Schumann harmonic visualizer & expansion control
├── docs/                         # Engineering manuals & specifications
│   ├── 46hz_ui_design_system.md  # Design tokens, aesthetics & A11y specifications
│   └── 46hz_arm64_and_architecture.md # Architecture evolution & Arm64 manual
├── lib/                          # Core domain services & utilities
│   ├── admin.ts                  # Admin session & RBAC enforcement
│   ├── ai/                       # Pluggable AI middleware (Mock & LLM)
│   ├── db.ts                     # Prisma client singleton (@prisma/adapter-pg)
│   ├── domain.ts                 # Domain types & state enums
│   ├── i18n/                     # Decoupled i18n core engine
│   ├── reply/                    # 15-minute concurrency holding protocol
│   ├── safety/                   # Risk classification & safety routing
│   └── session.ts                # Crockford Base32 migration & session cookies
├── locales/                      # Standalone translation data packs
│   ├── ko_KR.ts                  # Korean (default)
│   ├── en_US.ts                  # English
│   └── zh_CN.ts                  # Simplified Chinese
├── prisma/                       # Database schema & migrations
├── scripts/                      # Verification & maintenance tools
│   └── verify_backend.ts         # 7-phase end-to-end backend integrity test
├── tests/                        # Vitest automated test suites (18 files, 113 tests)
├── docker-compose.yml            # Multi-arch PostgreSQL service definition
├── Dockerfile                    # Production multi-stage multi-arch container build
├── settings.ts                   # Central application configuration
├── start.ps1                     # PowerShell automated orchestrator & launcher
└── package.json
```

---

## Quick Start (Automated Launcher)

On Windows, run the automated launcher script in PowerShell:

```powershell
.\start.ps1
```

The script will automatically:
1. Verify Node.js and npm versions.
2. Ensure PostgreSQL container is running (via Docker or WSLC).
3. Validate `.env` configuration.
4. Run Prisma schema generation and pending migrations.
5. Launch the Next.js development server on `http://localhost:3000`.

### Advanced Options:

```powershell
.\start.ps1 -VerifyOnly   # Run full 7-phase backend verification without launching server
.\start.ps1 -Seed         # Seed sample letters and support resources
.\start.ps1 -Prod         # Build production bundle and start server
.\start.ps1 -SkipChecks   # Fast launch skipping database readiness checks
```

---

## Manual Setup

### 1. Environment Configuration

```bash
cp .env.example .env
```

Key environment configurations in `.env`:

```env
DATABASE_URL="postgresql://46hz:46hz@localhost:5432/46hz_letterbox?schema=public"
ADMIN_PASSCODE="local-admin"
MODERATOR_PASSCODE="local-moderator"
AI_PROVIDER="mock" # Options: mock | openai | deepseek | custom
```

### 2. Start PostgreSQL

Using Docker Compose:
```bash
docker compose up -d
```

Or using WSLC (Windows WSL Container CLI):
```bash
wslc run -d --name 46hz-postgres -p 127.0.0.1:5432:5432 -e POSTGRES_USER=46hz -e POSTGRES_PASSWORD=46hz -e POSTGRES_DB=46hz_letterbox -v 46hz_postgres_data:/var/lib/postgresql/data postgres:16-alpine
```

### 3. Install Dependencies & Initialize Database

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000`. The application opens by default in Korean (`ko_KR`).

---

## Arm64 & Multi-Arch Platform Support

46Hz is architected for native compatibility with Apple Silicon (M1/M2/M3/M4), AWS Graviton, and standard x86_64 servers:

- **Prisma Multi-Arch Binaries**: `prisma/schema.prisma` declares:
  `binaryTargets = ["native", "linux-arm64-openssl-3.0.x", "linux-arm64-openssl-1.1.x", "linux-musl-arm64-openssl-3.0.x", "darwin-arm64"]`.
- **Driver Adapter Mode**: Uses `@prisma/adapter-pg` driver adapter for fast startup on ARM architectures.
- **Production Multi-Arch Docker Build**:
  ```bash
  docker buildx build \
    --platform linux/amd64,linux/arm64 \
    -t 46hz-letterbox:latest .
  ```

---

## Security Hardening & Compliance

- **Rate Limiting**: Sliding-window in-memory rate limiting on sensitive actions:
  - Admin sign-in: 5 attempts per 5 minutes.
  - Letter submission: 10 drafts per minute.
  - AI reply coaching: 10 requests per minute.
- **HTTP Security Headers**: Automated CSP, HSTS, X-Content-Type-Options, X-Frame-Options (`DENY`), and Referrer-Policy configured in `next.config.mjs`.
- **GDPR & Data Minimization Protocol (`46HZ-LE-PACKET-V1`)**:
  - Network IP logs are strictly purged after a rolling **14-day retention window**.
  - Maximum 5 recent IP entries retained per anonymous session.
  - Law enforcement export packet strictly redacts user content and provides only minimized trace metadata.

---

## Verification & Quality Assurance

To ensure zero regressions, run the full verification suite:

```bash
# 1. Run all 18 automated test suites (113 tests)
npm run test:run

# 2. Run TypeScript strict type-checking
npm run lint

# 3. Run comprehensive 7-phase backend integrity test
npm run verify:backend

# 4. Compile optimized Next.js production build
npm run build
```

---

## License

GPL-3.0 License. See [LICENSE](./LICENSE) for details.
