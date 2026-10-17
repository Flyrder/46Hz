# 46Hz UI/UX 디자인 시스템, 시스템 환경설정 스튜디오 및 독립 실행(Standalone) 최적화 매뉴얼
**46Hz UI/UX Design System, System Configuration Studio & Standalone Optimization Manual**

> **제품명**: 46Hz 편지함 (46Hz Letterbox v0.2.1)  
> **미학적 원형 (Aesthetic Archetype)**: 고요하고 따뜻한 종이 편지지 & 인간 중심의 캄 테크 (Calm Technology)  
> **핵심 주파수 (Core Frequency)**: 약 46Hz (지구 7차 슈만 공명 고조파)  
> **최종 업데이트**: 2026-10-16  

---

## 1. 정서적 철학과 캄 테크 (Emotional Philosophy & Calm Tech)

46Hz는 지친 마음들을 위한 인간 대 인간의 느린 익명 편지함입니다. 도파민 루프, 읽음 확인, 쉴 새 없이 쏟아지는 댓글을 유도하는 현대 소셜 미디어 피드와 달리, 46Hz는 **정서적 품어줌(Holding), 의도된 느림(Intentional Pacing), 심리적 안전감(Psychological Safety)**을 최우선으로 설계되었습니다.

### 1.1 46Hz 슈만 공명 은유 (The 46Hz Schumann Resonance Metaphor)
- **지구의 7차 고조파 (~45.9Hz $\approx$ 46Hz)**: 지구 전리층의 자연스러운 전자기적 맥동인 슈만 공명의 기본 주파수는 약 7.83Hz이며, 7차 고조파 피크는 약 46Hz에 위치합니다.
- **7개 답장 고조파 보호 (7-Reply Harmonic Protection)**: 46Hz의 각 편지는 **기본적으로 최대 7개의 승인된 답장**만을 수신할 수 있도록 제한됩니다. 이 의도된 제약은 상처받기 쉬운 작성자를 감정적 소음, 과도한 훈계, 댓글 공해로부터 안전하게 보호합니다.
- **심층 공명 확장 (최대 15개)**: 작성자가 정서적으로 안정을 찾고 더 많은 답장을 받아들일 준비가 되었을 때만, 슈만 공명 미터를 통해 편지의 답장 수용량을 직접 15개로 능동 확장할 수 있습니다.

### 1.2 물리적 편지함 점유 (안티 섀도우밴 심리학 설계)
- **15분 조용한 작성 보호 (15-Minute Quiet Writing Lease)**: 동료가 답장 작성을 시작하면 다른 동료와의 동시 작성 충돌을 방지하기 위해 15분 동안 편지를 조용히 품에 안아 보호합니다.
- **투명하고 따뜻한 인간적 은유**: 사용자를 불안하게 하거나 계정이 은밀히 차단(Shadowban)되었다고 오해하게 만드는 차가운 "시스템 잠금" 경고 대신, 동료들에게 다음과 같은 다정한 문구를 표시합니다: *"다른 동료가 편지를 소중히 읽고 정성껏 답장을 적고 있어요..."*
- **자발적 양보 메커니즘**: 답장을 작성 중인 동료는 언제든지 *"편지함에 다시 넣기"* 버튼을 눌러 편지를 즉시 공용 편지함으로 돌려놓을 수 있습니다.

---

## 2. 디자인 토큰 및 컬러 팔레트 (Design Tokens & Color Palette)

### 2.1 컬러 토큰
천연 석재(Warm Stone), 따뜻한 질감의 편지지(Stationery Paper), 마음을 차분히 가라앉히는 세이지 틸(Botanical Sage/Teal), 그리고 깊은 밤하늘(Midnight Slate)의 조화를 이룹니다:

| 토큰명 | 라이트 모드 (Warm Stone / Ecru) | 다크 모드 (Midnight Slate) | 심리적 기능 및 시각적 역할 |
|---|---|---|---|
| `--background` | `hsl(38 26% 96%)` (`#FAF7F2`) | `hsl(222 24% 8%)` (`#0F131A`) | 낮에는 따뜻한 양피지 질감, 밤에는 자극적인 완전 흑색(#000)을 배제한 깊고 차분한 밤하늘 슬레이트. |
| `--surface` | `hsl(0 0% 100%)` (`#FFFFFF`) | `hsl(222 20% 12%)` (`#181F2A`) | 섬세한 촉각적 테두리를 지닌 순수 카드 용지 높이감. |
| `--surface-paper` | `hsl(38 30% 98%)` (`#FCFAF7`) | `hsl(222 18% 14%)` (`#1C2431`) | 실제 종이 편지지를 연상시키는 편지 본문 전용 배경색. |
| `--foreground` | `hsl(218 22% 17%)` (`#222834`) | `hsl(214 24% 92%)` (`#E7ECF3`) | 라이트 모드의 차콜 잉크 텍스트, 다크 모드의 부드러운 은백색 텍스트로 눈의 피로를 최소화. |
| `--muted` | `hsl(216 18% 92%)` | `hsl(222 14% 17%)` | 은은한 칩(Pill) 및 구분선 표면. |
| `--muted-foreground` | `hsl(218 12% 43%)` | `hsl(218 14% 65%)` | 보조 메타 레이블 및 타임스탬프. |
| `--border` | `hsl(216 16% 85%)` | `hsl(222 14% 22%)` | 눈에 거슬리지 않는 섬세하고 부드러운 경계선. |
| `--accent` | `hsl(168 38% 34%)` (`#35796E`) | `hsl(168 46% 46%)` (`#3DBBA5`) | 고요와 생명력을 상징하는 그라운딩 세이지/틸 액센트 컬러. |
| `--accent-foreground` | `hsl(0 0% 100%)` | `hsl(222 26% 8%)` | 액센트 배경 위의 높은 명도 대비 라벨 컬러. |
| `--warning` | `hsl(38 88% 46%)` | `hsl(38 88% 54%)` | 민감한 안내 사항을 위한 부드러운 호박색(Amber). |
| `--danger` | `hsl(356 65% 48%)` | `hsl(356 70% 60%)` | 오류 및 위기 경고를 위한 부드러운 로즈/코랄 컬러. |

### 2.2 고도감(Elevation) 및 촉각적 그림자
- `--shadow-soft`: `0 16px 50px -35px rgba(54, 44, 34, 0.35)` — 카드 요소를 부드럽게 띄워 올리는 기본 그림자.
- `--shadow-tactile`: `0 8px 30px -10px rgba(54, 44, 34, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.04)` — 마우스 호버 시의 자연스러운 부유 효과.
- `--shadow-paper`: `0 1px 3px rgba(0, 0, 0, 0.04), 0 14px 40px -12px rgba(54, 44, 34, 0.15)` — 편지지 상단 하이라이트(`inset 0 1px 0 0 rgba(255, 255, 255, 0.5)`)가 결합된 실제 종이 질감 그림자.

---

## 3. 타이포그래피, 모던 CSS 진입 트랜지션 및 폼 인터랙션

### 3.1 타이포그래피
- **글꼴 스택**: 한국어 조형미에 최적화된 시스템 폰트 스택 (`ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif`).
- **본문 행간 (Line-Height)**: 편지 열람 및 작성 영역 전반에 걸쳐 `leading-relaxed` (1.625) ~ `leading-loose` (2.0)를 적용하여 호흡이 편안한 가독성 확보.
- **자간 (Letter Spacing)**: 정돈된 제목(`tracking-tight`)과 여유로운 본문(`tracking-normal`)의 조화.

### 3.2 마이크로 인터랙션
- **클릭 반응 스케일**: 버튼 및 인터랙티브 칩 클릭 시 미세하게 눌리는 피드백 (`active:scale-[0.98]` 또는 `active:scale-95`).
- **슈만 공명 펄스 (`schumann-pulse`)**: 활성화된 공명 노드에서 2.4초 주기의 호흡하듯 잔잔히 차오르는 빛의 애니메이션 연출.
- **촉각 카드 리프트**: 마우스 호버 시 카드가 부드럽게 떠오르는 모션 (`hover:-translate-y-0.5 hover:shadow-tactile hover:border-accent/40`).

### 3.3 모던 CSS 진입 트랜지션 (`@starting-style`) 및 점진적 폼 피드백 (`:user-invalid`)
- **자바스크립트 없는 순수 CSS 진입 모션 (`.animate-entry`)**:
  - [`app/globals.css`](file:///c:/Users/voide/eko/app/globals.css)에서 `@starting-style`을 사용하여 초기 렌더링 시 카드와 배너가 부드럽게 페이드인되며 떠오르는 효과 구현 (`opacity: 0; transform: translateY(6px) scale(0.992)` $\rightarrow$ `opacity: 1; transform: translateY(0) scale(1)`).
  - 구형 브라우저와의 호환성을 위해 `transition-behavior: allow-discrete`를 `transition` 축약형과 **별도로** 분리 선언.
  - 모션 축소 설정(`@media (prefers-reduced-motion: reduce)`) 감지 시 위치 이동을 비활성화하고 페이드인 시간을 단축하여 전정기관 질환 사용자를 배려.
- **사용자 친화적 폼 검증 (`:user-invalid` 및 `aria-invalid` 브릿지)**:
  - 브라우저 기본 `:invalid` 대신 `.validated-field:user-invalid`를 사용하여, 사용자가 필드를 입력하거나 벗어나기 전 페이지 로드 시점에 미리 붉은 경고가 뜨는 불쾌한 경험을 방지.
  - [`components/admin-settings-form.tsx`](file:///c:/Users/voide/eko/components/admin-settings-form.tsx)에서 `onBlur`, `onInput`, `onSubmit` 핸들러를 통해 `aria-invalid="true"`와 스크린리더용 `aria-describedby` 에러 메시지를 완벽하게 동기화.

---

## 4. 컴포넌트 아키텍처 가이드 (Component Architecture Guide)

### 4.1 내비게이션 셸 (`components/app-shell.tsx`)
- 프로스티드 글래스 고정 헤더 (`backdrop-blur-md bg-background/85 border-b border-border/70`).
- 실시간 시스템 설정과 연동되는 동적 브랜드 배지 (`brandSettings.name`, `brandSettings.tagline`, `7.83Hz`).
- 일체형 다국어 드롭다운 및 3단 슬라이딩 필 테마 토글 (`PreferenceForm`).
- 키보드 및 스크린리더 사용자를 위한 본문 바로가기 스킵 링크 (`#main-content`).
- 슈만 공명 설명, `/admin/settings` 바로가기, Zero-PII 보장 문구, 긴급 핫라인 링크가 포함된 푸터.

### 4.2 편지 작성 워크벤치 (`components/letter-editor.tsx`)
- 은은한 줄눈이 그어진 편지지 용지 컨테이너 (`stationery-paper`).
- 최소 40자 작성 기준 도달 상태를 부드러운 색상 전환으로 안내하는 실시간 글자수 카운터.
- 한국어, 영어, 중국어를 지원하는 4가지 감정별 영감 문구 칩 (Writing Sparks).
- 최종 제출 전 AI가 개인정보를 안전하게 익명화함을 보증하는 프라이버시 안내 배너.

### 4.3 슈만 공명 미터 (`components/resonance-meter.tsx`)
- 지구 슈만 공명 주파수 노드 시각화 (`7.8Hz`, `14.3Hz`, `20.8Hz`, `27.3Hz`, `33.8Hz`, `39.0Hz`, `45.9Hz` 및 최대 15차).
- 시각 상태 표현: 완결된 노드는 차분한 세이지 색상으로 채움, 현재 노드는 호흡하듯 맥동, 대기 노드는 외곽선 표시.
- 실시간 리더 지원 접근성 ARIA 프로그레스바 (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`).
- 작성자에게만 노출되는 최대 15개 확장 승인 버튼.

### 4.4 AI 답장 코치 워크벤치 (`components/reply-composer.tsx`)
- 실시간 글자수 카운터(최소 20자)가 포함된 따뜻한 입력 텍스트 영역.
- 원치 않는 훈계나 임의 진단을 지양하도록 돕는 공감 가이드라인.
- AI 코칭 패널: 비판단적 제안 카드, 감지된 표현에 대한 친절한 설명, 동료가 직접 선택해 편집할 수 있는 3가지 치유 톤 리프레이밍 문장 제공.

### 4.5 편지 엽서 카드 (`components/letter-card.tsx`)
- 섬세한 테두리와 둥근 모서리(rounded-2xl)를 지닌 편지 엽서 형태의 디자인.
- 메타데이터 행: 상태 배지, 위험도 배지, 슈만 공명 배지, 작성 일시.
- 하단 칩: 희망하는 답장 유형, 감정 해시태그, 도착한 답장 수 인디케이터.

---

## 5. 배리어 프리 웹 접근성 (KWCAG 2.2 / KS X 9256:2024 Standards)

46Hz는 한국형 웹 콘텐츠 접근성 지침 2.2 (**KWCAG 2.2 / 국가표준 KS X 9256:2024**) 및 W3C WCAG 2.2 AA 가이드라인의 4대 핵심 원칙을 전면 준수하도록 설계되었습니다:

### 5.1 인식의 용이성 (Perceivability)
1. **고대비 명도 (Contrast Minimum)**:
   - 본문 텍스트 명도 대비 4.5:1 이상 준수 (Light Mode Ecru Parchment: 12.3:1, Dark Mode Midnight Slate: 14.8:1로 AAA 수준 충족).
2. **비텍스트 콘텐츠 대체 텍스트 (Text Alternatives)**:
   - 모든 Lucide SVG 아이콘에 명시적 `aria-hidden="true"` 적용.
   - 단독 아이콘 버튼(NavIcon, CopyButton 등)에 명시적인 `aria-label` 및 `title` 제공.
3. **색상 독립성 (Use of Color)**:
   - 감정 상태 및 위험도 배지는 색상 외에도 텍스트 레이블(승인됨, 검토 대기, 주의 필요 등)을 명기하여 색각 이상자도 즉시 파악 가능.

### 5.2 운용의 용이성 (Operability)
1. **키보드 접근성 (Keyboard Accessible)**:
   - 모든 대화형 컨트롤이 마우스 없이 Tab/Enter/Space/방향키로 완전 제어 가능.
   - 선명한 2px 포커스 링(`focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none`)으로 현재 위치 표시 및 초점 트랩 방지.
2. **반복 영역 건너뛰기 (Skip Navigation)**:
   - 키보드 첫 탭 시 화면 좌상단에 부유하는 `#main-content` 본문 바로가기 링크(`skipToContent`) 제공.
3. **최소 조작 영역 크기 (Target Size)**:
   - 모든 상호작용 요소(버튼, 링크, 테마/언어 토글)에 **최소 44px × 44px** 조작 영역 (`min-h-[44px]`) 보장.
4. **충분한 시간 제공 (Timing Control)**:
   - 15분 답장 작성 잠금 창 제공 및 작성 포기 시 편지를 즉시 돌려놓는 자발적 반환(`공명 양보하기`) 메커니즘 제공.

### 5.3 이해의 용이성 (Understandability)
1. **기본 언어 표시 (Language of Page)**:
   - 최상단 HTML 태그에 `<html lang="ko-KR">` 선언 (언어 변경 시 `en-US`, `zh-CN`으로 동적 전환).
2. **예측 가능한 입력 서식 (Predictable Inputs)**:
   - 모든 입력 폼에 `<label htmlFor="...">` 명시적 연결.
   - 유효성 검사 실패 시 `:user-invalid`, `aria-invalid="true"`, `role="alert"`, `aria-describedby`를 통해 스크린리더에 에러 즉시 음성 출력.

### 5.4 견고성 (Robustness)
1. **WAI-ARIA 1.2 시맨틱 랜드마크**:
   - `role="banner"` (헤더), `role="navigation"` (내비게이션), `role="main"` (본문), `role="contentinfo"` (푸터), `role="progressbar"` (슈만 공명 메터).
2. **스크린리더 실시간 라이브 리전 (Live Regions)**:
   - 실시간 글자수 카운터 및 공명 노드 변경에 `aria-live="polite"` 적용.
   - 스크린리더(TalkBack, VoiceOver, 센스리더, NVDA, Windows Narrator) 전방위 음성 낭독 지원.

---

## 6. 웹 관리자 시스템 환경설정 스튜디오 (`/admin/settings`) 및 실시간 `settings.ts` 동기화

관리자(`ADMIN` 권한)는 서버를 재시작하거나 소스코드를 수동 편집하지 않고도 브라우저 화면 **`/admin/settings`**([`app/admin/settings/page.tsx`](file:///c:/Users/voide/eko/app/admin/settings/page.tsx))에서 시스템의 모든 핵심 파라미터를 즉시 설정할 수 있습니다:

### 6.1 설정 가능 도메인
1. **브랜드 및 아이덴티티 (`brandSettings`)**:
   - 서비스명(`name`), 슬로건(`tagline`), 설명(`description`) 설정 (페이지 타이틀 자동 반영).
2. **슈만 공명 및 느린 편지함 규격 (`brandSettings.schumannResonance`)**:
   - 기본 최대 답장 수(`defaultMaxReplies`: 기본 7통), 심층 확장 최대 답장 수(`expandedMaxReplies`: 기본 15통), 점유 보호 시간(`leaseDurationMinutes`: 기본 15분).
3. **기본 사용자 환경 및 세션 (`i18nSettings`, `themeSettings`, `sessionSettings`)**:
   - 기본 언어(`ko_KR` | `en_US` | `zh_CN`), 기본 테마(`system` | `light` | `dark`), 세션 쿠키 유효기간(`sessionCookieMaxAgeDays`: 기본 30일).
4. **보안 및 데이터 최소화 규정 (`securitySettings`, `complianceSettings`)**:
   - 레이트 리밋 요청 한도 및 윈도우 시간, 연결 IP 롤링 보관 기간(`metadataRetentionDays`: 기본 14일), 법원 영장 필수 여부, 익명 데이터 내보내기 및 즉시 파기 허용 여부.
5. **공감 AI 미들웨어 설정 (`aiSettings`)**:
   - 기본 공급자(`mock` | `openai` | `deepseek` | `custom`), 공급자별 모델명 지정.

### 6.2 2계층 영속성 아키텍처 ([`lib/settings-store.ts`](file:///c:/Users/voide/eko/lib/settings-store.ts))
- **인메모리 런타임 변이 (`applyRuntimeSettingsUpdate`)**: [`settings.ts`](file:///c:/Users/voide/eko/settings.ts)의 익스포트 객체를 런타임 메모리에서 즉시 갱신하여, 다음 요청부터 모든 서버 컴포넌트와 서버 액션에 즉각 반영.
- **디스크 영속화 동기화**:
  - 컨테이너 및 독립 실행(Standalone) 환경의 재시동 복원을 위해 `.settings.override.json`에 최신 설정을 기록 (`ensureSettingsLoadedFromDisk()`).
  - 프로젝트 루트의 소스코드인 [`settings.ts`](file:///c:/Users/voide/eko/settings.ts) 파일 내부의 리터럴 값을 직접 업데이트하여 코드베이스와 웹 UI의 100% 동기화 유지.
  - 모든 설정 변경 이력은 `ModerationActionLog`에 `UPDATE_SYSTEM_SETTINGS` 또는 `RESET_SYSTEM_SETTINGS` 감사 이벤트로 불변 기록.

---

## 7. 독립 실행(Standalone) 빌드 및 `node_modules` 경량화 아키텍처

Next.js 독립 실행 빌드와 개발 환경에서 Prisma 7(`@prisma/client`)과 Prisma 8 RC(`@prisma/orm` + `@prisma/sql-postgres`)를 병렬로 운용하면서도 프로덕션 번들을 극도로 슬림하게 유지하기 위한 최적화 체계입니다:

1. **[`next.config.mjs`](file:///c:/Users/voide/eko/next.config.mjs)의 `outputFileTracingExcludes`**:
   - CLI/개발 전용 패키지(`prisma`, `@prisma/composer*`, `@prisma/studio-core`, `workerd`, `@alchemy.run`, `typescript`, `vitest`, `tsx`) 및 구형 Prisma 6 바이너리 엔진(`query-engine-*`)을 `.next/standalone/node_modules` 추적 대상에서 완전히 배제.
2. **자동 경량화 스크립트 ([`scripts/purge_standalone.ts`](file:///c:/Users/voide/eko/scripts/purge_standalone.ts) / `npm run purge:modules`)**:
   - `node_modules` 및 `.next/standalone/node_modules`에서 런타임에 불필요한 **약 2.23 GB**의 비런타임 찌꺼기(중첩된 `alchemy` 클라우드 SDK, `workerd`, `.cache`, 구형 네이티브 쿼리 엔진 바이너리 등)를 제거하여, 독립 실행 번들 크기를 **약 23.3 MB** 수준으로 극적 압축.
3. **최소형 Docker Runner 스테이지 ([`Dockerfile`](file:///c:/Users/voide/eko/Dockerfile))**:
   - 거대한 `@prisma` 전체 네임스페이스 대신, 트레이싱된 `.next/standalone` 번들과 정확히 필요한 Prisma 7 동기화 모듈(`@prisma/client`, `@prisma/adapter-pg`, `@prisma/client-runtime-utils`, `@prisma/driver-adapter-utils`)만 선별 복사하여 초경량 프로덕션 컨테이너 완성.
