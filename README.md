# 46Hz Letterbox

A quiet, web-first, mobile-first anonymous emotional support letter app.

46Hz is built around a single, safe, human-to-human slow loop:

$$\text{Write Letter} \longrightarrow \text{AI Anonymize & Screen} \longrightarrow \text{Author Review} \longrightarrow \text{Admin Moderation} \longrightarrow \text{Peer Reply} \longrightarrow \text{AI Reply Coach} \longrightarrow \text{Admin Moderation} \longrightarrow \text{Receive Reply} \longrightarrow \text{Feedback}$$

It is not a therapy, diagnosis, medical, legal, public forum, or real-time chat product. AI acts strictly as an editable, transparent middleware layer between people.

---

## Key Features & Architecture

- **Human-Centered Letter Holding Protocol (Anti-Shadowban Design)**:
  - When a peer opens a letter to write a reply, the letter is quietly held for a 15-minute focused writing window to prevent multiple overlapping responses.
  - Transparent physical letterbox metaphor: Peers see that someone is thoughtfully drafting a reply, and responders can click "Put back in letterbox" at any time to release it. No confusing "lockout" or "shadowban" states.
- **Default Korean (`ko_KR`) & Thoroughly Decoupled i18n Architecture**:
  - The application defaults to Korean (`ko_KR`), with English (`en_US`) and Simplified Chinese (`zh_CN`) fully supported.
  - Complete architectural decoupling between translation content data ([locales/](file:///c:/Users/voide/eko/locales)) and engine logic ([lib/i18n/](file:///c:/Users/voide/eko/lib/i18n)). Zero language files reside directly under `lib/i18n/`.
- **Arm64 & Multi-Arch Platform Support**:
  - Configured with Prisma multi-arch binary targets (`linux-arm64-openssl-3.0.x`, `linux-arm64-openssl-1.1.x`, `linux-musl-arm64-openssl-3.0.x`, `darwin-arm64`, and `native`).
  - Production-ready multi-stage `Dockerfile` (Node 20 Bookworm slim, non-root runner) and `docker-compose.yml` optimized for Apple Silicon, AWS Graviton, and x86_64 servers.
- **Pluggable AI Middleware (`AiMiddleware`)**:
  - Default deterministic, zero-dependency `MockAiMiddleware` runs offline without API keys.
  - Hot-swappable production LLM adapter (`LlmAiMiddleware`) supporting `openai`, `deepseek` (with automated `<think>...</think>` reasoning tag stripping and enum sanitization), and `custom` OpenAI-compatible gateways.
  - Automatic graceful fallback to Mock on timeout or network degradation.
- **Granular Admin RBAC**:
  - Dual-role authentication separating **Admin** (`ADMIN_PASSCODE`) from **Moderator** (`MODERATOR_PASSCODE`).
  - Moderators can review letters and replies, inspect moderation logs, and view reports, while user suspensions and emergency crisis resources remain restricted to Admins.
- **Zero PII & Device Migration Codes**:
  - No email/password database accounts.
  - Anonymous sessions with typo-safe Crockford Base32 migration codes (e.g. `46HZ-XXXX-XXXX`) for cross-device session transfers.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Actions, React 19)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS + Lucide Icons + System/Light/Dark Themes
- **Database & ORM**: PostgreSQL + Prisma ORM 6.x
- **Validation**: Zod 3.x
- **Testing**: Vitest 4.x
- **Containerization**: Multi-arch Docker & Docker Compose

---

## Project Structure

```
c:\Users\voide\eko\
├── app/                          # Next.js App Router
│   ├── actions/                  # Server Actions (letters, replies, admin, feedback, onboarding)
│   ├── admin/                    # Admin portal (dashboard, letters, replies, reports, users, resources)
│   ├── api/                      # Public API routes (health check, AI proxy endpoints)
│   ├── inbox/                    # User inbox (received letters & sent replies)
│   ├── letters/[id]/             # Letter detail & feedback submission
│   ├── onboarding/               # Anonymous session creation & migration code restore
│   ├── reply/                    # Peer reply pool & reply workbench ([letterId])
│   ├── settings/                 # Profile, migration code export, theme, language
│   ├── support-resources/        # Emergency mental health crisis resources
│   └── write/                    # Letter writing & review
├── components/                   # Reusable UI components & layouts
├── docs/                         # Engineering architecture & Arm64 manuals
│   └── 46hz_arm64_and_architecture.md
├── lib/                          # Core domain services & utilities
│   ├── admin.ts                  # Admin session & RBAC enforcement
│   ├── db.ts                     # Prisma client singleton
│   ├── domain.ts                 # Enums & domain types
│   ├── i18n/                     # i18n engine infrastructure (zero language files)
│   │   ├── config.ts             # Default locale & options
│   │   ├── types.ts              # Translation keys & locale types
│   │   └── index.ts              # Core translator engine
│   ├── ai/                       # AI Middleware (interfaces, mock, pluggable LLM)
│   ├── reply/                    # Concurrency claiming & letter holding protocol
│   ├── safety/                   # Risk classification & crisis routing
│   └── session.ts                # Session management & migration codes
├── locales/                      # Standalone language dictionaries (pure content data)
│   ├── ko_KR.ts                  # Korean language pack (default)
│   ├── en_US.ts                  # English language pack
│   ├── zh_CN.ts                  # Simplified Chinese language pack
│   └── index.ts                  # Locales dictionary aggregator
├── prisma/                       # Database schema & migrations
├── tests/                        # Vitest automated test suites (11 suites, 62 tests)
├── docker-compose.yml            # PostgreSQL service definition
├── Dockerfile                    # Multi-arch production container build
└── package.json
```

---

## Local Development

### 1. Environment Setup

Copy example environment variables:

```bash
cp .env.example .env
```

Key environment configurations in `.env`:

```env
DATABASE_URL="postgresql://46hz:46hz_dev_password@localhost:5432/46hz_letterbox?schema=public"
ADMIN_PASSCODE="local-admin"
MODERATOR_PASSCODE="local-moderator"
AI_PROVIDER="mock" # Options: mock | openai | deepseek | custom
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

### 3. Install Dependencies & Generate Database Client

```bash
npm install
npm run prisma:migrate
npm run prisma:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open `http://localhost:3000`. By default, the application opens in Korean (`ko_KR`). You can toggle language and theme in the header navigation or `/settings`.

---

## Verification & Quality Assurance

Run the automated test suite (Vitest):

```bash
npm run test:run
```

Run static type checking:

```bash
npm run lint
```

Build production bundle with Next.js Turbopack:

```bash
npm run build
```

---

## Multi-Arch Docker Build (Arm64 / AMD64)

Build a multi-architecture container image using Docker Buildx:

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t 46hz-letterbox:latest .
```

---

## Acceptance Workflow

1. Go to `/onboarding` to start an anonymous session (default Korean).
2. Go to `/write`, draft a letter, and review the AI-anonymized version.
3. Confirm the letter. It transitions into `PENDING` moderation.
4. Go to `/admin`, sign in with `local-admin`, open `/admin/letters`, and approve the letter.
5. In another browser profile, enter `/reply` to browse approved letters.
6. Open the letter: it enters the 15-minute quiet protection window (`OFFERED`). Draft a reply with the AI Reply Coach and submit.
7. Under `/admin/replies`, approve the reply.
8. As the author, open `/inbox` and view the approved response, leaving feedback.
