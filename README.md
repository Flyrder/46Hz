# EKO Letterbox MVP

A web-first, mobile-first anonymous emotional support letter app. This MVP builds only the complete loop:

`write letter -> admin approve -> peer reply -> admin approve -> receive reply -> feedback`

It is not a therapy, diagnosis, medical, legal, public forum, or real-time chat product. AI is implemented as editable middleware between people.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma ORM
- Zod validation
- Server Actions and small API routes
- Deterministic mock AI middleware
- Vitest unit tests

## Local Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Start Postgres:

```bash
docker compose up -d
```

3. Install dependencies:

```bash
npm install
```

4. Create tables and seed data:

```bash
npm run prisma:migrate
npm run prisma:seed
```

5. Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

Admin passcode defaults to `local-admin` in `.env.example`.

## Manual Acceptance Flow

1. Go to `/onboarding` and create an anonymous session.
2. Go to `/write`, write a safe letter, and review the AI-processed version.
3. Confirm the letter. It should enter pending moderation.
4. Go to `/admin`, sign in, open `/admin/letters`, and approve the letter.
5. Create another anonymous session in a separate browser/profile, or clear the session in `/settings`.
6. Go to `/reply`, open the approved letter, write a reply, run the reply coach, and submit it.
7. In `/admin/replies`, approve the reply.
8. Return as the original writer and open `/inbox`, then the letter detail page.
9. Leave feedback on the approved reply.
10. Check `/admin/moderation-log` and `/admin/reports`.

High-risk letters containing direct self-harm language are routed to `/support-resources` and are not shown in `/reply`.

## Tests

```bash
npm run test:run
```

Current coverage focuses on:

- Mock AI letter processing, anonymization, risk classification, and reply coaching
- Risk routing and peer matching gates
- Moderation status transitions and responder trust score updates

## AI Middleware

The app works without API keys. `MockAiMiddleware` implements:

- `processLetter`
- `coachReply`
- `classifyRisk`
- `anonymize`

`getAiMiddleware()` is the provider boundary. A real LLM adapter can be added behind `AI_PROVIDER` without changing core product logic.
