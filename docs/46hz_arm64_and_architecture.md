# 46Hz 아키텍처 진화 및 Arm64 멀티 아키텍처 최적화 실무 매뉴얼
**46Hz Architecture Evolution & Arm64 Multi-Arch Adaptation Guide**

> 작성 일자: 2026-10-11 (최종 업데이트: 2026-10-17)  
> 적용 버전: 46Hz Letterbox (v0.2.1)  
> 연관 문서: [46Hz UI/UX 디자인 시스템 매뉴얼](./46hz_ui_design_system.md)

---

## 1. 브랜드 리브랜딩: EKO에서 46Hz로 (Brand Rebranding)

### 1.1 브랜드 함의와 정서 철학
- **네이밍 의미**: 46Hz는 청각적 인지와 미세한 진동 감각의 경계에 맞닿아 있는 극저주파수(ELF) 대역입니다. 감성 음향학에서 이러한 온화한 저주파 공명은 불안을 잠재우고 마음에 안정감을 부여하는 치유적 특성을 갖습니다. 이는 편지가 전달하는 온기를 상징합니다. 시끄럽게 소리치지 않고, 46Hz의 나지막한 맥동처럼 번잡한 인터넷의 심연 속에서 상처받거나 외로운 모든 영혼에게 깊고 흔들림 없는 화답을 건넵니다.
- **제품 핵심 순환 루프**:
  $$\text{익명 편지 작성} \longrightarrow \text{AI 정돈 및 탈민감화} \longrightarrow \text{검토 게이트웨이} \longrightarrow \text{동료 수신 및 답장} \longrightarrow \text{AI 코칭 및 윤문} \longrightarrow \text{2차 검토} \longrightarrow \text{배달 및 피드백}$$

### 1.2 전 구간 식별자 및 영속성 마이그레이션 내역
1. **프론트엔드 및 애플리케이션 셸**:
   - 글로벌 Header Logo: `E / EKO`에서 `46 / 46Hz`로 승격.
   - 루트 레이아웃 메타데이터 타이틀: `46Hz Letterbox`로 갱신.
   - 서비스 헬스체크 엔드포인트 `/api/health` 응답 식별자: `46hz-letterbox` 반영.
2. **다국어(i18n) 모듈 완전 분리 및 한국어 기본값 지정**:
   - **기본 언어**: 시스템 기본 언어를 전역적으로 한국어(`ko_KR`)로 설정.
   - **완전한 디커플링 설계 (콘텐츠와 엔진의 물리적 격리)**:
     - `locales/{ko_KR, en_US, zh_CN}.ts`: 비즈니스 로직과 물리적으로 완전히 격리된 순수 언어 사전 패키지.
     - `locales/index.ts`: 언어 패키지 집계 및 타입 세이프 바인딩.
     - `lib/i18n/types.ts`: `Locale`, `TranslationKey`, `Translations` 타입 계약 전용 모듈.
     - `lib/i18n/config.ts`: `defaultLocale = "ko_KR"` 및 지원 언어 목록 집중 관리.
     - `lib/i18n/index.ts`: 언어 파일 없이 동작하는 순수 국제화 라우팅 및 폴백 엔진.
     - `lib/i18n.ts`: 외부 모듈을 위한 단일화된 전방위 re-export 게이트웨이.
   - 마이그레이션 자리표시자 형식: `46HZ-XXXX-XXXX`로 표준화.
3. **세션 및 쿠키 격리 설계**:
   - 익명 사용자 식별 쿠키: `46hz_user_id`.
   - 언어 환경설정: `46hz_locale`.
   - 테마 환경설정: `46hz_theme`.
   - 관리자/모더레이터 권한: `46hz_admin_role` (`ADMIN` 또는 `MODERATOR` 저장).
   - 기기 간 익명 이전 코드: Crockford Base32 변형(혼동하기 쉬운 `0, 1, I, O` 제외)을 채택하고 접두사를 `46HZ-` (`46HZ-XXXX-XXXX` 형태)로 표준화.

---

## 2. 동시 답장 충돌 제어: 물리 편지함 점유 보호 프로토콜 (Human-Centered Letter Holding Protocol)

### 2.1 비즈니스 페인포인트 및 섀도우밴(Shadowban) 방지 심리학 설계
초기 시스템 설계에서 "선점(Claim)", "잠금(Locked)", "15분 임대(15-min Lease)"와 같은 기술 용어와 경고색(Amber/Warning) 뱃지를 직접 노출했을 때, 사용자들은 **자신의 계정이 시스템에 의해 감시당하거나, 은밀히 권한이 제한(Shadowban)된 것**으로 심각한 오해와 불안감을 겪었습니다.

이러한 차가운 알고리즘 통제감을 불식시키기 위해, 46Hz는 동시성 제어 기술을 따뜻한 **물리적 느린 우체통 은유**로 완전히 재해석했습니다:
- **다른 방문 동료의 화면**: "잠금/선점됨" 대신 따뜻한 배려 문구 노출: *"다른 동료가 편지를 소중히 읽고 있어요 — 작성자가 온전히 집중된 답장을 받을 수 있도록, 이 편지는 다른 동료가 잠시 품에 안고 정성껏 답장을 적고 있습니다. 15분 동안 조용히 지켜봐 주세요."*
- **현재 답장을 작성 중인 동료의 화면**: "15분 독점 임대 보유 중" 대신 안내: *"마음을 담아 적는 중 · 온전한 집중을 위해 15분간 이 편지를 지켜드립니다."*와 함께, 언제든 부담 없이 양보할 수 있는 *"편지함에 다시 넣기 (다른 동료에게 양보)"* 버튼 제공.
- **시각적 비경고화**: 자극적인 주황색/경고색 박스를 전면 철거하고, 따스한 중립 카드 배경(`bg-surface`)과 서정적인 깃펜 아이콘(`PenLine`)으로 전환.

### 2.2 기저 점유 보호 프로토콜 (Holding Protocol)
외부 Redis 의존성 없이 `lib/reply/claiming.ts` 내에서 기존 Prisma `Match` 모델을 기반으로 경량의 시간 윈도우 점유 보호 메커니즘을 구현했습니다:

```text
[동료가 /reply 편지 보관함 진입]
        │
        ▼
[다른 동료가 보호 중이거나 이미 답장 완료된 편지 제외] ──> matches.none(status == OFFERED && createdAt >= now - 15m)
        │
        ▼
[동료가 /reply/[letterId] 클릭하여 열람]
        │
        ▼
[claimLetterForReply(letterId, userId) 실행]
        │
        ├── 타인이 15분 보호 시간 내 작성 중 ──> "다른 동료가 편지를 소중히 읽고 있어요" 안내 및 다른 편지 탐색 유도
        │
        └── 보호 중이 아니거나 15분 타임아웃 경과
                │
                ▼
        [Match 생성/갱신: status=OFFERED, createdAt=now] ──> 15분간 조용한 단독 작성 보호
                │
                ▼
        [동료가 submitReplyAction 실행하여 답장 제출]
                │
                ├── 점유 유효성 검증 및 중복 제출 방지
                │
                ▼
        [DB 트랜잭션: Reply(PENDING) 생성, Match(RESPONDED) 갱신, ModerationEvent 기록]
```

### 2.3 상태 머신 및 경계 조건
- **보호 윈도우 유효 시간**: `CLAIM_LEASE_MINUTES = 15` (정확히 900초).
- **상태 전이 규칙**:
  - `OFFERED` (동시에 $T_{\text{now}} - T_{\text{create}} < 15\text{분}$): 현재 보호 및 작성 중.
  - `OFFERED` (동시에 $T_{\text{now}} - T_{\text{create}} \ge 15\text{분}$): 보호 시간 만료. 편지가 자동으로 공용 편지함으로 회귀하며 다음 동료에게 개방(기존 레코드는 `EXPIRED`로 처리).
  - `RESPONDED`: 답장 제출 완료 (최종 상태).
  - `SKIPPED`: 자발적 양보 (UI의 "편지함에 다시 넣기" 클릭 시 `releaseReplyClaimAction` 트리거). 15분을 기다릴 필요 없이 즉시 점유 해제.
- **중복 답장 방지**: `coachReplyAction`과 `submitReplyAction` 양단에서 동일 사용자가 동일 편지에 중복 제출하는 것을 원천 차단하며, `/reply/[letterId]` 접근 시 "이미 따뜻한 답장을 보내셨습니다" 전용 감사 카드를 렌더링.
- **순수 함수 기반 단위 테스트 보장**: `isClaimExpired`, `isMatchActiveClaim`, `calculateRemainingLeaseSeconds`를 순수 함수로 완전히 분리하여 Vitest에서 밀리초 단위 경계값 테스트 100% 달성.

---

## 3. 프로덕션급 다중 제공자 LLM 플러그형 아키텍처 (Pluggable AI Architecture)

### 3.1 추상 계층 인터페이스 설계 (`lib/ai/middleware.ts`)
46Hz의 비즈니스 로직(Server Actions, API 라우트)은 특정 LLM SDK에 직접 종속되지 않고 `AiMiddleware` 순수 인터페이스에만 의존합니다:
- `processLetter(input)`: 편지 내용을 정돈 및 탈민감화하고, 구조화된 감정/상황 태그 및 희망 위로 유형을 도출.
- `coachReply(input)`: 답장의 톤(비판단성, 온화함, 공감성)을 점검하고 부드러운 치유적 표현으로 다듬도록 코칭.
- `classifyRisk(input)`: 4단계 위험도 분류 및 긴급 위기 상황 분기判定.
- `anonymize(input)`: PII 개인정보(전화번호, 주민등록번호, 이메일, 계좌, 주소, 실명 등) 탐지 및 마스킹.

### 3.2 다중 모델 어댑터 (`lib/ai/llm.ts`)
OpenAI Chat Completions API 표준 규격을 채택하여 `LlmAiMiddleware`를 캡슐화하고 다중 벤더를 한 줄 설정으로 전환할 수 있도록 구현했습니다:

| 제공자 | `AI_PROVIDER` | 기본 Base URL | 기본 모델 | 인증 방식 |
| :--- | :--- | :--- | :--- | :--- |
| **OpenAI** | `openai` | `https://api.openai.com/v1` | `gpt-4o-mini` | `Bearer ${OPENAI_API_KEY}` |
| **DeepSeek** | `deepseek` | `https://api.deepseek.com/v1` | `deepseek-chat` | `Bearer ${DEEPSEEK_API_KEY}` |
| **사용자 호환 엔드포인트** | `custom` | `process.env.AI_BASE_URL` | `process.env.AI_MODEL` | `Bearer ${AI_API_KEY}` |
| **Mock (오프라인)** | `mock` | N/A (로컬 규칙 엔진) | Deterministic | 인증 불필요 |

### 3.3 무중단 우아한 폴백 및 방어적 장애 허용 (Graceful Degradation & Resilience)
외부 대규모 언어 모델은 네트워크 지연, 서버 장애, 429 레이트 리밋, 비정형 포맷 반환 등의 통제 불가능한 요소를 수반합니다:
1. **추론형 사고 사슬 태그 정제**: DeepSeek R1 등 추론 모델이 출력하는 `<think>...</think>` 태그를 자동으로 분리·제거하여 JSON 파싱 오염을 원천 차단.
2. **열거형(Enum) 안전 정규화**: 모델이 대소문자가 혼합된 비표준 값(`"normal"`, `"comfort"` 등)을 반환하더라도 Prisma 강타입 Enum 규격으로 강제 교정하여 데이터베이스 제약 조건 충돌 방지.
3. **최외곽 JSON 내성 추출**: 마크다운 코드 블록(```json) 감싸기 및 앞뒤 자연어 서술이 섞여 있는 경우에도 정규식을 통해 순수 JSON 블록만 견고하게 추출.
- **이중 안전장치(Dual-Safety)**: `LlmAiMiddleware` 인스턴스 내부에 언제나 `MockAiMiddleware`를 상시 보유.
- **폴백 트리거 조건**:
  1. 해당 제공자의 API Key가 미설정된 경우 (`isConfigured === false`).
  2. 네트워크 요청 타임아웃 발생 시 (기본 10초 타임아웃).
  3. HTTP 5xx, 429 오류 응답 수신 또는 최종 JSON 파싱 실패 시.
- **신뢰성 보장**: 어떠한 외부 장애 상황에서도 서버 로그에 상세 경고를 기록한 후 즉시 로컬 규칙 엔진으로 대체 작동하여, 사용자의 글쓰기·답장·검토 핵심 프로세스가 절대 중단되지 않습니다.

---

## 4. 세분화된 RBAC 권한 및 단계별 검토 체계 (Granular Admin & Moderator RBAC)

### 4.1 역할 정의 및 권한 매트릭스
커뮤니티 성장에 따른 운영 분업을 지원하기 위해 관리자 권한을 2단계 역할로 분리했습니다:

| 권한 항목 | 최고 관리자 (ADMIN) | 온기 모더레이터 (MODERATOR) |
| :--- | :---: | :---: |
| **대시보드 지표 조회** (`/admin`) | ✅ 접근 및 통계 확인 | ✅ 접근 및 통계 확인 |
| **편지 검토 및 승인/반려** (`/admin/letters`) | ✅ 승인 / 반려 / 라우팅 | ✅ 승인 / 반려 / 라우팅 |
| **편지 위험도 수동 변경** (`/admin/letters/[id]`) | ✅ 위험 등급 재설정 | ✅ 위험 등급 재설정 |
| **답장 검토 및 승인/반려** (`/admin/replies`) | ✅ 승인 / 반려 | ✅ 승인 / 반려 |
| **신고 내역 모니터링** (`/admin/reports`) | ✅ 전체 신고 확인 | ✅ 전체 신고 확인 |
| **운영 감사 로그** (`/admin/moderation-log`) | ✅ 전체 작업 이력 확인 | ✅ 전체 작업 이력 확인 |
| **사용자 계정 제재** (`/admin/users`) | ✅ 제재/차단 실행 | ❌ 권한 없음 (안내 배너 표시) |
| **위기 지원 리소스 관리** (`/admin/resources`) | ✅ 생성/수정/삭제 | ❌ 권한 없음 (안내 배너 표시) |

### 4.2 인증 및 작업 감사 추적
- **역할별 전용 접속 암호 분리**:
  - `ADMIN_PASSCODE` (기본값 `local-admin`) 입력 시 `ADMIN` 최고 권한 부여.
  - `MODERATOR_PASSCODE` (기본값 `local-moderator`) 입력 시 `MODERATOR` 검토 권한 부여.
- **감사 로그 책임성 확립**: 모든 검토 작업이 `ModerationEvent`에 기록될 때, 수행자 역할이 `ADMIN_MODERATED` 또는 `MODERATOR_MODERATED`로 명확히 구분되어 운영 투명성을 보장합니다.

---

## 5. Arm64 / AArch64 아키텍처 크로스 플랫폼 최적화 실무 가이드 (Multi-Arch Arm64 Guide)

Apple Silicon(M시리즈), AWS Graviton(t4g/c7g), Oracle Ampere 및 Arm64 Linux 기반의 서버나 에지 디바이스에서 최신 Node.js/Prisma 애플리케이션을 구동할 때 가장 빈번하게 발생하는 이슈는 C/C++ 사전 컴파일 바이너리 호환성입니다.

### 5.1 Prisma Engine 바이너리 적응 핵심
`prisma/schema.prisma` 설정 표준:
```prisma
generator client {
  provider      = "prisma-client-js"
  engineType    = "binary"
  binaryTargets = ["native", "linux-arm64-openssl-3.0.x", "linux-arm64-openssl-1.1.x", "linux-musl-arm64-openssl-3.0.x", "darwin-arm64"]
}
```

#### 주요 트러블슈팅 및 해결책:
1. **오류**: `PrismaClientInitializationError: Query engine binary for current platform "linux-arm64-openssl-3.0.x" could not be found.`
   - **원인**: 기본 설정 시 Prisma는 빌드를 수행하는 호스트 환경(예: macOS x86 또는 amd64 컨테이너)의 바이너리만 다운로드합니다. 이 빌드 결과물을 Ubuntu/Debian 기반 ARM64 이미지에서 실행하면 해당 바이너리가 누락되어 기동 즉시 크래시가 발생합니다.
   - **대책**: `binaryTargets`에 `linux-arm64-openssl-3.0.x`를 명시적으로 선언합니다.
2. **Alpine Linux (musl libc) 호환성 문제**:
   - Alpine은 표준 `glibc` 대신 `musl`을 사용합니다. 베이스 이미지가 `node:alpine`이고 배포 대상이 ARM64인 경우, Prisma는 `linux-musl-arm64-openssl-3.0.x` 바이너리를 요구합니다. 누락 시 `ENOENT`가 발생합니다.
   - **대책**: `binaryTargets`에 `linux-musl-arm64-openssl-3.0.x`를 추가하거나, 표준 glibc 기반인 `node:bookworm-slim` 이미지를 권장합니다.
3. **OpenSSL 버전 차이 대응**:
   - 최신 Linux 이미지는 OpenSSL 3.0을 기본 탑재하지만, 구형 또는 특수 환경은 OpenSSL 1.1에 머물러 있을 수 있습니다. `openssl-3.0.x`와 `openssl-1.1.x`를 함께 명시하여 다양한 Linux 배포판에서 중단 없이 동작하도록 보장합니다.

### 5.2 프로덕션급 멀티 아키텍처 Dockerfile 모범 실무
46Hz는 크로스 아키텍처 빌드에 최적화된 표준 `Dockerfile`을 구축했습니다:
- 멀티 스테이지 빌드 (`dependencies` $\rightarrow$ `builder` $\rightarrow$ `runner`).
- 빌드 단계에서 `npx prisma generate`를 명시적으로 실행하여 모든 대상 아키텍처에 맞는 바인딩 생성.
- 프로덕션 런타임에서 devDependencies를 완전히 배제하고 비루트 계정 `nextjs (1001:1001)`로 실행.

#### 멀티 아키텍처 빌드 명령어 예시:
```bash
# Docker Buildx 활성화
docker buildx create --use

# amd64 및 arm64 동시 빌드 및 레지스트리 푸시
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t your-registry/46hz-letterbox:latest \
  --push .
```

---

## 6. 슈만 공명 7차 고조파 및 심층 확장 메커니즘 (46Hz Schumann Resonance Cap)

### 6.1 과학 물리적 근거 및 브랜드 아이덴티티
- **지구 전리층의 자연 공명**:
  지구 표면과 전리층 사이의 도파관 공동에서 번개 방전에 의해 발생하는 극저주파수 정상파인 **슈만 공명(Schumann Resonance)**의 기본 주파수는 약 $7.83\text{ Hz}$입니다.
  지구-전리층 공동의 유한 전도도 및 감쇠(Damping)를 반영하여 자연 고조파 모드를 실측하면 다음과 같습니다:
  - 1차 고조파: $\approx 7.83\text{ Hz}$
  - 2차 고조파: $\approx 14.3\text{ Hz}$
  - 3차 고조파: $\approx 20.8\text{ Hz}$
  - 4차 고조파: $\approx 27.3\text{ Hz}$
  - 5차 고조파: $\approx 33.8\text{ Hz}$
  - 6차 고조파: $\approx 39.0\text{ Hz}$
  - **7차 고조파: $\approx 45.3 \sim 46.0\text{ Hz} \approx 46\text{Hz}$** $\longrightarrow$ **이것이 바로 46Hz 브랜드 명칭의 과학 물리적 기원입니다.**

### 6.2 제품 정서 철학 및 수용 한도 제어
- **기본 7개 고조파 보호 (The 7 Harmonic Resonances)**:
  수백 개의 댓글이 달리는 자극적인 SNS 피드는 상처받은 마음에게 위로가 아닌 정서적 소음과 정보 과부하를 초래합니다. 46Hz는 작성자의 마음을 안전하게 보호하기 위해, **편지당 기본 최대 7개의 승인된 답장**만을 수신하도록 엄격히 제한합니다. 7개의 답장은 지구의 7차 자연 진동과 맞닿아 있으며, 작성자가 한 통 한 통 정성을 다해 음미할 수 있는 최적의 정서적 한계입니다.
- **작성자의 능동적 선택에 의한 15개 심층 확장 (Opt-in Expansion up to 15)**:
  작성자가 더 많은 온기를 받아들일 마음의 준비가 되었을 때, 편지 상세 화면에서 직접 **"더 깊은 공명 열기 (최대 15개로 확장)"** 버튼을 클릭할 수 있습니다. 서버 액션 `expandLetterResonanceAction`을 통해 안전하게 상한을 15개로 확장합니다.
- **시스템 성능 및 동시성 쿼리 최적화**:
  1. **복합 인덱스 가속**: `Letter` 테이블에 `@@index([status, riskLevel, maxReplies, createdAt])`를 구성하여 공용 답장 풀의 고빈도 페이징 조회를 커버링 인덱스로 고속 처리.
  2. **답장 풀 실시간 필터링**: `findAvailableReplyLetters`에서 Prisma `_count` 조건을 통해 유효 답장 수가 상한에 도달한 편지를 실시간으로 목록에서 제외.
  3. **기회주의적 만료 락 자동 회수**: 별도의 무거운 Cron 데몬 없이, 목록 조회 시점에 15분이 경과한 방치된 `OFFERED` 점유 락을 일괄 비동기 감지하여 `EXPIRED`로 정리.
  4. **온화한 완결 화면 UI**: 답장 상한에 도달한 편지에 접근할 경우, "공명이 아름답게 완결되었습니다" 카드(`RESONANCE_LIMIT_REACHED`)를 안내하며 다른 편지로 온기를 나누도록 유도.

---

## 7. 미니멀리즘 기술 스택 경량화 및 심층 보안/무장애 강화 (Minimalism & Security)

### 7.1 미니멀리즘 기술 스택 군살 제거 (Zero-Dependency Engineering)
- **`clsx` 마이크로 의존성 제거**: `lib/utils.ts` 내에 순수 TypeScript 재귀 알고리즘(약 30줄)으로 자체 `cn` 함수를 구현하여 외부 런타임 종속성을 완전히 제거.
- **`autoprefixer` 제거**: Tailwind CSS v4에 내장된 고성능 Rust/Lightning CSS 엔진을 직접 활용하여 불필요한 PostCSS 플러그인 오버헤드 제거.
- **순수 런타임 정제**: Next.js 16, React 19, Prisma 7, pg 원시 드라이버 풀, Zod, Lucide Icons만으로 핵심 스택을 압축.

### 7.2 다계층 보안 강화 (Multi-Tier Security Hardening)
1. **프로덕션급 HTTP 보안 헤더**:
   - `Content-Security-Policy (CSP)`: 엄격한 스크립트 도메인 제한으로 XSS 차단.
   - `X-Frame-Options: DENY`: iframe 임베딩 방지를 통한 클릭재킹(Clickjacking) 원천 차단.
   - `X-Content-Type-Options: nosniff`: 브라우저의 임의 MIME 스니핑 차단.
   - `Referrer-Policy: strict-origin-when-cross-origin`: 크로스 오리진 요청 시 리퍼러 유출 방지.
   - `Permissions-Policy`: 마이크, 카메라, 지오로케이션 등 불필요한 브라우저 디바이스 권한 완전 비활성화.
   - `Strict-Transport-Security (HSTS)`: 전 구간 HTTPS 강제 전송.
2. **타이밍 공격 방지 인증 (Timing-Safe Passcode Verification)**:
   - Node.js 원시 `crypto.timingSafeEqual` 사용.
   - 검증 전 SHA-256을 통해 고정 32바이트 다이제스트로 정규화하여, 문자열 길이에 따른 응답 시간 편차로 암호를 추론하는 사이드 채널 공격을 원천 방어.
3. **인메모리 슬라이딩 윈도우 레이트 리미터 (`lib/safety/rate-limit.ts`)**:
   - 만료된 타임스탬프를 실시간으로 정리하는 슬라이딩 윈도우 알고리즘.
   - 관리자 로그인 시도에 대해 IP당 5분 내 최대 5회로 제한하여 무차별 대입 공격(Brute-Force)을 방어하고, AI 윤문 API의 과도한 오남용을 방지.

### 7.3 스크린리더 무장애 웹 접근성 (KWCAG 2.2 / KS X 9256:2024 준수)
Android TalkBack, iOS VoiceOver, Windows Narrator 사용자를 위한 세심한 접근성 지원:
- **본문 건너뛰기 링크 (Skip to Content)**: 첫 Tab 입력 시 화면 최상단에 나타나 `<main id="main-content">`로 즉시 초점 이동.
- **시맨틱 랜드마크 명시**: `<header role="banner">`, `<nav aria-label="...">`, `<main id="main-content" role="main">`, `<footer role="contentinfo">`.
- **최소 조작 영역 확보 (Target Size)**: 모든 버튼과 링크의 인터랙션 면적을 **44px × 44px 이상**으로 구현.
- **동적 상태 실시간 음성 출력 (ARIA Live Regions)**:
  - 슈만 공명 미터에 `role="progressbar"`, `aria-valuenow`, `aria-live="polite"` 적용.
  - 전송 중 상태는 `aria-busy="true"`와 스크린리더 전용 문구(`<span className="sr-only">처리 중...</span>`)로 실시간 전달.
  - 유효성 검증 오류는 `role="alert"`와 `aria-live="assertive"`로 즉시 낭독.

### 7.4 백엔드 관리 규제 준수 및 사법 공조 데이터 최소화 원칙 (Data Minimization)
GDPR 제5조 1항 (c)호의 데이터 최소화 원칙과 사법 공조 의무를 기술적으로 균형 있게 결합:
1. **절대적 제로 PII 원칙 (Zero-PII Architecture)**:
   - 데이터베이스에 실명, 주민등록번호, 연락처, 비밀번호, GPS 위치, 기기 고유 시리얼을 일절 기록하지 않으며, 무작위 익명 닉네임(`Letter RNJME` 등)으로만 관리.
2. **14일 롤링 보관 주기 및 자동 물리 파기 (14-Day Rolling Horizon)**:
   - 보안 목적의 연결 IP는 계정당 최대 5건으로 제한되며, 14일 경과 시 데이터베이스에서 영구 물리 삭제.
3. **일상 운영 IP 마스킹 (`maskIp`)**:
   - 일반 운영 대시보드에서는 `192.168.***.***` 형태로 마스킹하여 내부자의 사적 정보 열람을 방지.
4. **암호학적 위변조 방지 컴플라이언스 인시던트 패킷 (`generateIncidentPacket`)**:
   - 법원 영장 등 법적 요청 발생 시 `/admin/compliance`에서 표준 JSON 증거 패킷(`ComplianceIncidentPacket`) 생성.
   - 대상 텍스트에 대한 SHA-256 해시, UTC 타임스탬프, 모더레이션 이력 체인, 최소한의 마스킹된 네트워크 출처를 포함하여 법정 증거 능력을 확보.

### 7.5 클라이언트 User-Agent 정보 수집 및 단일 루트 설정 센터 (`settings.ts`)
1. **경량 원시 User-Agent 파서**:
   - 외부 라이브러리 없이 브라우저(Chrome, Safari 등), 운영체제(Windows, iOS, Android 등), 디바이스 유형을 판별하여 `User.recentIps`에 JSONB로 안전하게 적재.
2. **단일 루트 설정 파일 (`settings.ts`) 집중화**:
   - 브랜드, i18n, 테마, 세션, 관리자 암호, 슈만 공명 한도, 레이트 리밋 등 전역 설정값을 루트의 `settings.ts`에서 단일 관리.
3. **루트 디렉터리 정돈**:
   - Tailwind v4 전환에 따른 잉여 `tailwind.config.ts` 및 구형 `start.bat`을 정리하고, PowerShell 기반 `start.ps1`으로 실행 체계 통일.

---

## 8. 검증 기록 및 품질 보증 (Verification Record)

### 8.1 자동화 테스트 지표
- **테스트 러너**: Vitest 5.0.4
- **테스트 결과**: 19개 테스트 파일, 125개 단위/통합 테스트 100% 전원 통과.
- **주요 검증 영역**:
  - `tests/client/user-agent.test.ts`: User-Agent 추출 및 플랫폼 파싱 검증.
  - `tests/settings/settings.test.ts`: 전역 `settings.ts` 계약 단언 검증.
  - `tests/ip.test.ts`: IP 큐 저장 및 14일 자동 파기 로직 검증.
  - `tests/utils/cn.test.ts`: 순수 TypeScript `cn` 유틸리티 검증.
  - `tests/security/security.test.ts`: 시간차 공격 방지 비교 및 슬라이딩 윈도우 레이트 리밋 검증.
  - `tests/compliance/compliance.test.ts`: SHA-256 증거 패킷 및 14일 롤링 보관 검증.
  - `tests/reply/resonance.test.ts`: 7개 및 15개 슈만 공명 흐름 검증.
  - `tests/reply/claiming.test.ts`: 15분 편지 점유 보호 프로토콜 검증.
  - `scripts/verify_backend.ts`: PostgreSQL 7단계 백엔드 통합 검증 전원 통과.

### 8.2 주요 개발 및 유지보수 명령어
```bash
# 전체 단위 및 통합 테스트 실행 (125 tests)
npm run test:run

# PostgreSQL 백엔드 7단계 전 구간 무결성 실측
npm run verify:backend

# Prisma 8 RC 데이터 계약 아티팩트 발행 (Contract Emit)
npm run prisma8:contract

# TypeScript 정적 타입 검사
npm run lint

# Next.js 프로덕션 빌드 (Prisma 7 Client + Standalone Output)
npm run build
```

---

## 9. 차세대 기술 스택 진화 및 보안 심층 강화 (Next-Gen Stack & Security Hardening)

### 9.1 Node.js 26 런타임 및 멀티 아키텍처 지원
- **도커 베이스 이미지**: `Dockerfile`의 베이스 이미지를 최신 **`node:26-bookworm-slim`**으로 승격.
- **아키텍처 대응**: `linux/amd64` 및 `linux/arm64` (Apple Silicon, AWS Graviton, Raspberry Pi) 환경에서 원활한 빌드 및 가벼운 독립 실행(Standalone) 보장.
- **엔진 선언**: `package.json`의 `engines`에 Node.js 26 지원을 명시(`^24.0.0 || >=26.0.0`).

### 9.2 Prisma 8 RC & Prisma 7 병렬 운용 아키텍처 (Side-by-Side Operation)
- **배경**: Prisma 8 RC는 기존 모놀리식 스키마 방식에서 탈피하여, 에이전트 친화적인 **PSL 데이터 계약(Data Contract)** 및 확장 모듈 분리(`@prisma/orm-postgres`)로 전면 개편되었습니다.
- **병렬 아키텍처 설계**:
  1. **Prisma 8 RC 계약 관리**:
     - `prisma/contract.prisma`: `// use prisma-8` 헤더 및 최신 PSL 명세 준수.
     - `prisma8.config.ts`: `@prisma/cli-engine`의 `definePrismaConfig` 및 `@prisma/orm-postgres/config`의 `defineConfig`와 `prisma7Schema` 브릿지를 연결.
     - `npm run prisma8:contract`: `prisma contract emit` 명령을 통해 `contract.json` 및 `contract.d.ts` 아티팩트 자동 생성.
  2. **Prisma 7 런타임 호환 엔진 (`@prisma/prisma7`)**:
     - 기존 비즈니스 로직(Server Actions, Seed, Database Client)의 안정적 구동을 위해 `@prisma/prisma7`을 네임스페이스 격리 설치.
     - `prisma7.config.ts`를 통해 기존 Prisma 클라이언트를 오차 없이 생성(`prisma7 generate`).

### 9.3 PostgreSQL 19 Beta 컨테이너 오케스트레이션
- **도커 이미지 승격**: `docker-compose.yml` 및 `start.ps1`의 데이터베이스 이미지를 **`postgres:19beta4-alpine3.24`**로 업그레이드.
- **헬스체크 및 의존성 제어**: `pg_isready`를 통한 컨테이너 헬스체크 및 애플리케이션 서비스의 `condition: service_healthy` 보장.

### 9.4 심층 보안 강화 (Defense-in-Depth Security Hardening)
1. **CSP (Content-Security-Policy) 추가 제약**:
   - `base-uri 'self'`: `<base>` 태그 변조를 통한 스크립트/리소스 기준 주소 하이재킹 차단.
   - `form-action 'self'`: 악성 외부 엔드포인트로의 폼 데이터 전송 차단.
   - `object-src 'none'`: 플래시 및 플러그인 기반 임베드 벡터 차단.
   - `X-Permitted-Cross-Domain-Policies: none`: 플래시/실버라이트 정책 파일 로드 차단.
2. **관리자 쿠키 엄격 모드 적용 (`sameSite: "strict"`)**:
   - 관리자 및 중재자 세션 쿠키(`46hz_admin_role`, `46hz_admin`)의 `sameSite` 설정을 `"lax"`에서 **`"strict"`**로 격상하여 외부 유입 링크를 통한 CSRF 공격을 원천 무력화.
3. **컨테이너 최소 권한 원칙 (Principle of Least Privilege)**:
   - `Dockerfile` 내 non-root 사용자(`nextjs:nodejs`, UID/GID 1001) 권한으로만 서버 프로세스를 구동하여 컨테이너 탈출 및 호스트 권한 탈취 방지.
