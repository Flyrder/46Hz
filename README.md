# 46Hz 느린 편지함 (46Hz Letterbox)

<div align="center">

**인간 중심의 온화하고 고요한 익명 정서적 지지 슬로우 레터박스**

[![Next.js 16.4](https://img.shields.io/badge/Next.js-16.4-black.svg?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.x%20Strict-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS 4](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma ORM 7](https://img.shields.io/badge/Prisma-7.10%20pg--adapter-2D3748.svg?logo=prisma)](https://www.prisma.io/)
[![Vitest](https://img.shields.io/badge/Vitest-142%20Passed-6E9F18.svg?logo=vitest)](https://vitest.dev/)
[![Multi-Arch](https://img.shields.io/badge/Arch-Arm64%20%7C%20AMD64-orange.svg?logo=docker)](https://www.docker.com/)
[![KWCAG 2.2](https://img.shields.io/badge/A11y-KWCAG%202.2%20%2F%20KS%20X%209256-emerald.svg)](#8-배리어-프리-웹-접근성-kwcag-22--ks-x-92562024)
[![Zero PII](https://img.shields.io/badge/Privacy-Zero%20PII%20GDPR-teal.svg)](#보안-강화-및-데이터-최소화-규정-준수)

</div>

---

## 브랜드 철학: 46Hz 슬로우 루프 (The 46Hz Slow Loop)

46Hz는 지구 전리층의 **제7 슈만 공명 모드(7th Schumann Resonance Mode, 약 45.9Hz ≈ 46Hz)**에서 착안되었습니다. 

지구 표면과 전리층이 이루는 거대한 구형 도파관 공동(Earth-ionosphere cavity)에서 발생하는 극저주파(ELF) 전자기 정상파는 단순한 정수배($7.83 \times n$)로 선형 증가하지 않으며, 전리층 D층의 유한 전도도와 감쇠(Damping) 특성으로 인해 실측 기준 다음과 같은 고유 진동수를 형성합니다:
- **제1 모드 (기본 주파수)**: 약 7.83 Hz
- **제2 모드**: 약 14.3 Hz
- **제3 모드**: 약 20.8 Hz
- **제4 모드**: 약 27.3 Hz
- **제5 모드**: 약 33.8 Hz
- **제6 모드**: 약 39.0 Hz
- **제7 모드 (46Hz 고조파)**: **약 45.9 Hz (≈ 46 Hz)**

지구의 전자기적 혼란이 대기의 감쇠 과정을 거쳐 안정되고 차분한 정상파로 수렴되듯, 46Hz는 즉각적인 반응과 자극적인 피드가 지배하는 디지털 환경 속에서 상처받고 지친 인간의 마음에 여유롭고 안전한 사색의 쉼터를 제공합니다.

```mermaid
flowchart LR
    A["비공개 편지 작성<br/>(Write Privately)"] --> B["AI 익명화 & 탈민감화<br/>(AI Anonymize)"]
    B --> C["작성자 대조 & 확정<br/>(Author Review)"]
    C --> D["운영자 안전 검토<br/>(Moderation)"]
    D --> E["또래 답장 집필<br/>(Peer Reply)"]
    E --> F["AI 답장 코칭 & 톤 레이더<br/>(AI Reply Coach)"]
    F --> G["운영자 검토<br/>(Moderation)"]
    G --> H["답장 수신 & 공명<br/>(Receive & Resonate)"]
    H --> I["온화한 감정 피드백<br/>(Warm Feedback)"]
```

> [!NOTE]
> 46Hz는 **의료 기관, 심리 진단 도구 또는 실시간 응급 위기 상담 채팅이 아닙니다.** 인공지능(AI)은 사람과 사람 사이를 가로막는 대체재가 아니라, 온기를 전달하는 안전하고 투명한 매개 미들웨어로만 작동합니다. 급박한 심리적 위기 상황에 처한 편지는 즉시 24시간 전문 위기상담 핫라인으로 안전하게 안내됩니다.

---

## 서비스 대상 지역 및 다국어 지원 정책 (Service Demographics & Localization)

### 1. 대한민국(Republic of Korea) 중심 설계
- 46Hz는 1차적으로 **대한민국 내 청년, 직장인, 학생, 정서적 고립감이나 번아웃을 겪는 이웃들**의 마음을 돌보기 위해 기획되었습니다.
- 기본 언어는 **한국어(`ko_KR`)**이며, 전체 사용자 인터페이스와 시스템 알림은 정중하고 따뜻한 "해요체" 문구 완충 프로토콜을 전면 채택하고 있습니다.

### 2. 다문화 포용 및 외국인 정착 지원
- 한국에 거주 중인 외국인 유학생, 체류자, 이주민 구성원이 언어적 소외 없이 따뜻한 위로를 주고받을 수 있도록 **한국어(`ko_KR`), 영어(`en_US`), 중국어 간체(`zh_CN`)**의 3개 언어를 기본 내장하고 있습니다.
- 모든 UI 텍스트와 관리자 화면은 100% 완전 대칭 i18n 딕셔너리로 관리되어 하드코딩된 문자열이 일체 없습니다.

### 3. 중국어권 유지관리자(Maintainer Context) 지원
- 중국어 지원은 국내 중국어권 이용자뿐만 아니라, **시스템을 함께 유지보수하고 운영하는 중국어권 오픈소스 개발자 및 관리자(Chinese-speaking maintainers)**가 아키텍처 의도와 관리자 콘솔을 직관적으로 파악할 수 있도록 배려하여 정교하게 문서화 및 번역되었습니다.

### 4. 전문 위기 상담 자원(Hotlines)의 엄격한 지역 한정
- 생명의 위기나 극심한 고통에 처한 분들에게 검증되지 않은 해외 연락처가 노출되는 위험을 원천 차단하기 위해, 지원 자원은 **대한민국(KR)**과 **중국 본토(CN)**의 공식 공공 위기 핫라인으로 엄격히 한정됩니다 (미국 988 등 타 국가 자원 완전 배제):
  - **대한민국 (KR)**: 24시 자살예방 상담전화 (`109`), 보건복지상담센터 (`1393`), 정신건강 위기상담전화 (`1577-0199`), 청소년 상담전화 (`1388`), 한국생명의전화 (`1588-9191`)
  - **중국 대륙 (CN)**: 희망24 전국심리위기개입핫라인 (`400-161-9995`), 공청단 청소년 심리지원핫라인 (`12355`), 베이징 심리위기연구및개입센터 (`010-82951332`)

---

## 8대 핵심 기능 (Key Features)

### 1. 슈만 공명 화음 답장 정원 (Harmonic Reply Cap: 기본 7개 → 확장 15개)
- **기본 7개 정원 제한**: 섣부른 조언의 폭주와 수백 개의 댓글이 주는 감정적 압박감을 막기 위해, 편지당 수신 가능한 답장을 지구 제7 슈만 공명 모드를 상징하는 **최대 7개**로 제한합니다.
- **작성자의 주체적 15개 확장**: 편지 작성자가 더 많은 동료들의 온기를 받아들일 정서적 준비가 되었을 때, 편지 상세 화면에서 **"더 깊은 공명 열기"** 버튼을 직접 눌러 최대 15개까지 정원을 확장할 수 있습니다.
- **온화한 완결 보관**: 정원에 도달한 편지는 신규 답장 작성이 안전하게 마감되며 편지함 탐색 풀에서 평온하게 보관 상태로 전환됩니다.

### 2. 15분 사려 깊은 집필 점유 (Anti-Collision 15-Minute Letterbox Lease)
- **동시 작성 충돌 방지**: 한 편지에 여러 사람이 동시에 답장을 쓰다가 다른 사람이 먼저 제출하여 노력이 헛되이 버려지는 허탈감을 원천 방지합니다.
- **15분 배타적 점유**: 동료가 편지를 열고 답장을 작성하기 시작하면 15분(900초) 동안 해당 편지에 점유 락이 부여됩니다.
- **물리적 우체통 은유**: 위협적인 "접근 금지" 경고 대신, *"다른 동료가 편지를 읽고 정성스럽게 답장을 적고 있어요"*라는 따뜻한 상태를 표시합니다.
- **자발적 공명 양보**: 답장을 이어가기 어렵거나 다른 편지를 쓰고 싶을 때는 언제든 *"우체통에 다시 돌려놓기 (공명 양보하기)"* 버튼을 눌러 즉시 다른 동료에게 편지를 양보할 수 있습니다.

### 3. 공감 지능형 AI 미들웨어 & 톤 레이더 (`AiMiddleware`)
- **100% 무중단 오프라인 Mock 지원 (`MockAiMiddleware`)**: 외부 API 키가 없거나 네트워크가 단절된 격리망 환경에서도 완벽한 한국어 형태소 기반 익명화, 공감 코칭, 글감 생성이 오프라인으로 결정론적 동작합니다.
- **핫스왑 프로덕션 멀티 LLM (`LlmAiMiddleware`)**: OpenAI (GPT-4o), DeepSeek (추론 태그 `<think>...</think>` 자동 정제), Google Gemini, Anthropic Claude, Ollama 등 다양한 공급자를 `.env` 설정만으로 즉시 교체 가능하며, 상위 API 장애 시 지체 없이 Mock으로 자동 폴백(Fallback)합니다.
- **글쓰기 마중물 어시스턴트 (Writing Sparks)**: 무거운 마음에 첫 문장을 시작하기 어려운 이용자를 위해 감정 상태(번아웃, 불안, 외로움, 자책)에 맞춘 4가지 온화한 시작 문장을 원클릭으로 제안합니다.
- **3차원 톤 레이더 (Tone Radar)**: 또래 답장의 **공감(Empathy)**, **온화함(Gentleness)**, **비판단성(Non-judgmental)**을 실시간 측정하고, 지시적이거나 훈계조의 표현을 "공감과 온기", "부드러운 인정", "따뜻한 관점 제시"의 3가지 치유적 문장으로 자동 다듬어 줍니다.
- **시맨틱 공명 매칭 (Resonance Matcher)**: 코사인 유사도를 활용하여 작성자의 고민과 답장 작성자의 심리적 지향점이 가장 잘 어우러지는 편지에 "공명 추천" 배지를 부여합니다.

### 4. 작성자 주권 통제: 원문-정제문 Diff 대조, 구절 코멘트 & 소버린 영구 삭제
- **원문 대 정제문 비교(Diff 대조)**: 편지 작성 및 검토 화면에서 원문(Raw Text)과 AI 익명화 정돈본(Processed Text)을 나란히 대조하여, 개인정보가 안전하게 보호되었는지 직접 확인하고 문장을 수정한 뒤 최종 발송할 수 있습니다.
- **인터랙티브 본문 구절 코멘트 (Passage Comments)**: 편지 상세 화면에서 마음에 울림을 주는 특정 문장이나 구절을 선택하여 개인적인 생각과 성찰 메모(마진 노트)를 남길 수 있습니다.
- **소버린 영구 삭제 (Permanent Sovereign Deletion)**: 작성자는 자신의 편지를 언제든 즉시 영구 삭제할 수 있으며, 연결된 모든 답장, 매칭 기록, 집필 락이 안전하게 연쇄 삭제(Cascade)됩니다.

### 5. 제로 PII(개인식별정보 0) & Crockford Base32 기기 이전
- **데이터베이스 계정 체계 완전 배제**: 이메일, 비밀번호, 실명, 전화번호를 일체 수집하거나 보관하지 않는 순수 익명 세션 모델입니다.
- **Crockford Base32 이전 코드 (`46HZ-XXXX-XXXX`)**: 혼동하기 쉬운 문자(`0`, `1`, `I`, `O`)를 배제한 안전한 8자리 코드를 통해 브라우저나 스마트폰을 변경하더라도 자신의 편지함과 신뢰 점수(Trust Score)를 안전하게 복원할 수 있습니다 (서버에는 SHA-256 해시로만 보관).

### 6. 세분화된 이중 역할 관리자 RBAC (Role-Based Access Control)
- **최고 관리자 (`ADMIN_PASSCODE`)**: 사용자 정지/해제, 핫라인 리소스 관리, 사법 공조 데이터 패킷 추출을 포함한 전권 행사.
- **온기 모더레이터 (`MODERATOR_PASSCODE`)**: 이용자 제재나 시스템 설정 접근이 차단된 안전한 환경에서, 편지와 답장의 승인/반려, 신고 내역 검토, 감사 로그 열람 등 콘텐츠 안전 검토에만 집중.

### 7. 아날로그 편지지 감성 & 미드나잇 다크 모드
- **자연스러운 편지지 질감**: 편안한 양장지와 돌결 질감 배경(`#FAF7F2`), 눈이 편안한 줄 간격(`leading-relaxed`), 부드러운 카드 그림자.
- **미드나잇 다크 모드**: 차가운 완전 흑색 대신 눈의 피로를 진정시켜 주는 차분한 딥 슬레이트 블루(`#0F131A` / `hsl(222 24% 8%)`) 팔레트 제공.

### 8. 배리어 프리 웹 접근성 (KWCAG 2.2 / KS X 9256:2024)
46Hz는 **한국형 웹 콘텐츠 접근성 지침 2.2 (국가표준 KS X 9256:2024)** 및 W3C WCAG 2.2 AA 요구사항을 엄격하게 준수합니다:
- **인식의 용이성 (Perceivability)**: 본문 텍스트 12.3:1 (다크 모드 14.8:1)의 고대비 준수, 모든 아이콘에 `aria-hidden` 또는 의미 있는 대체 텍스트 제공, 색상에만 의존하지 않는 텍스트 상태 배지 병기.
- **운용의 용이성 (Operability)**: 마우스 없는 순수 키보드 조작 완벽 지원, 본문 바로가기 링크(`#main-content`) 제공, 모든 대화형 컨트롤에 **44px × 44px 이상** 터치 영역 확보 (`min-h-[44px]`).
- **이해의 용이성 (Understandability)**: `<html lang="ko-KR">` 동적 선언, 명시적인 `<label htmlFor="...">` 폼 연결 및 `aria-invalid`, `role="alert"` 에러 공지.
- **견고성 (Robustness)**: WAI-ARIA 1.2 시맨틱 랜드마크 및 실시간 상태 변동을 알리는 `aria-live="polite"` 스크린리더 지원.

---

## 단일 진실 공급원 설정 (`settings.ts`)

모든 서비스 정책, 임계값, 컴플라이언스 기준은 [settings.ts](./settings.ts)에 중앙 집중 관리됩니다:

```typescript
import { settings } from "@/settings";

// 브랜드 메타데이터
settings.brand.name;               // "46Hz"
settings.brand.tagline;            // "A quiet anonymous emotional support letterbox."

// 슈만 공명 화음 정원
settings.resonance.defaultMaxReplies;   // 7 (제7 슈만 공명 모드 기본값)
settings.resonance.expandedMaxReplies;  // 15 (작성자 주도 심층 확장값)

// 집필 동시성 점유
settings.claiming.leaseDurationMinutes; // 15분 (900초)

// 데이터 최소화 및 컴플라이언스
settings.compliance.ipRetentionDays;    // 14일 롤링 보관 후 자동 소멸
settings.compliance.maxRecentIps;       // 세션당 최대 5개 IP 이력 제한
```

---

## 프로젝트 디렉터리 구조 (Project Structure)

```
46hz/
├── app/                          # Next.js App Router (React 19)
│   ├── actions/                  # 서버 액션 (편지, 답장, 피드백, 온보딩, 관리자)
│   ├── admin/                    # 관리자 워크벤치 (대시보드, 편지, 답장, 신고, 사용자, 리소스, 컴플라이언스)
│   ├── api/                      # 공용 API 라우트 (헬스체크, AI 프록시 엔드포인트)
│   ├── inbox/                    # 받은 편지함 및 작성한 답장 보관함
│   ├── letters/[id]/             # 편지 상세, 슈만 공명 게이지, 구절 코멘트 및 피드백
│   ├── onboarding/               # 익명 세션 생성 및 기기 이전 코드 복원
│   ├── reply/                    # 또래 답장 탐색 풀 및 작성 워크벤치 ([letterId])
│   ├── settings/                 # 프로필, 기기 이전 코드 발급, 테마 및 언어 설정
│   ├── support-resources/        # 24/7 전문 위기 상담 핫라인 안내 (KR, CN)
│   ├── write/                    # 편지 작성 및 AI 정제본 Diff 대조 화면
│   ├── globals.css               # 디자인 토큰, 편지지 질감 스타일, 미드나잇 다크 모드
│   └── layout.tsx                # 접근성 AppShell 래퍼 루트 레이아웃
├── components/                   # 재사용 가능한 UI 컴포넌트
│   ├── ui/                       # 배리어 프리 버튼, 모달 및 입력 폼 요소
│   ├── app-shell.tsx             # 건너뛰기 링크, 헤더 내비게이션, 푸터 래퍼
│   ├── letter-card.tsx           # 편지지 엽서 카드 및 감정 태그 배지
│   ├── letter-editor.tsx         # 편지지 줄 노트 작성기 및 글감 마중물 연동
│   ├── preference-form.tsx       # 테마 및 언어 변경 컨트롤
│   ├── reply-composer.tsx        # AI 답장 코칭 워크벤치 및 톤 레이더 인터페이스
│   └── resonance-meter.tsx       # 슈만 공명 주파수 시각화 및 15개 확장 제어기
├── docs/                         # 엔지니어링 매뉴얼 및 기술 규격서
│   ├── 46hz_complete_features_manual.md # 전체 기능 명세 및 시스템 아키텍처 매뉴얼
│   ├── 46hz_ui_design_system.md         # 디자인 토큰, 타이포그래피, KWCAG 2.2 지침
│   └── 46hz_arm64_and_architecture.md   # 시스템 진화 및 Arm64 플랫폼 명세
├── lib/                          # 핵심 도메인 서비스 및 유틸리티
│   ├── admin.ts                  # 관리자 세션 쿠키 검증 및 RBAC 인가
│   ├── ai/                       # 플러그형 AI 미들웨어 (Mock, LLM, PII 탈민감화)
│   ├── db.ts                     # Prisma Client 싱글톤 (@prisma/adapter-pg)
│   ├── domain.ts                 # 도메인 타입 정의 및 상태 열거형
│   ├── i18n/                     # 다국어 엔진 코어
│   ├── reply/                    # 15분 집필 점유 락 및 충돌 방지 로직
│   ├── safety/                   # 위험도 분류 및 위기 자원 라우팅
│   └── session.ts                # Crockford Base32 기기 이전 및 익명 세션 쿠키
├── locales/                      # 독립형 다국어 번역 팩 (100% 키 대칭)
│   ├── ko_KR.ts                  # 한국어 (기본)
│   ├── en_US.ts                  # 영어
│   └── zh_CN.ts                  # 간체 중국어
├── prisma/                       # 데이터베이스 스키마 및 마이그레이션
│   ├── schema.prisma             # 멀티 아키텍처 바이너리 선언 및 모델 정의
│   └── seed.ts                   # 한국/중국 공식 핫라인 및 초기 시드 데이터
├── scripts/                      # 시스템 무결성 검증 및 유지보수 도구
│   └── verify_backend.ts         # 7단계 엔드투엔드 백엔드 무결성 자동 검증 스크립트
├── tests/                        # Vitest 자동화 테스트 스위트 (22개 파일, 142개 테스트)
├── docker-compose.yml            # 멀티 아키텍처 PostgreSQL 컨테이너 정의
├── Dockerfile                    # 경량화 멀티 스테이지 프로덕션 컨테이너 빌드
├── settings.ts                   # 중앙 집중식 시스템 설정
├── start.ps1                     # 윈도우 PowerShell 자동화 런처 스크립트
├── start.sh                      # macOS (Apple Silicon / Intel) 및 Linux POSIX 런처 스크립트
└── package.json
```

---

## 빠른 시작 가이드 (Quick Start)

### 🥇 가장 간편한 방법: Docker Compose 원클릭 실행 (추천)

Docker만 설치되어 있다면 Node.js나 데이터베이스 설정 없이 명령어 한 줄로 웹앱과 PostgreSQL 데이터베이스가 즉시 함께 구동됩니다:

```bash
docker compose up -d
```

- **웹 애플리케이션**: `http://localhost:3000`
- **관리자 포털**: `http://localhost:3000/admin` (비밀번호: `local-admin` / 중재자: `local-moderator`)
- **실시간 헬스 체크**: `http://localhost:3000/api/health`

---

### 🥈 로컬 개발 환경 실행: PowerShell 자동 런처 (Windows)

Windows 환경에서는 PowerShell 자동 런처 스크립트를 사용하여 원클릭으로 구동할 수 있습니다:

```powershell
.\start.ps1
```

런처 스크립트는 다음 작업을 자동으로 처리합니다:
1. Node.js 및 npm 설치 버전 확인
2. Docker 또는 WSLC를 통한 PostgreSQL 데이터베이스 컨테이너 자동 감지 및 기동
3. `.env` 환경 변수 구성 검증
4. Prisma 클라이언트 생성 및 대기 중인 마이그레이션 적용
5. Next.js 개발 서버 실행 (`http://localhost:3000`)

#### 런처 고급 실행 옵션:
```powershell
.\start.ps1 -VerifyOnly   # 서버 실행 없이 7단계 백엔드 무결성 검증만 수행
.\start.ps1 -Seed         # 기본 위기 자원 및 샘플 편지 데이터 시드 적용
.\start.ps1 -Prod         # 프로덕션 빌드 컴파일 후 프로덕션 모드로 서버 구동
.\start.ps1 -SkipChecks   # DB 연결 대기 검사를 건너뛰고 빠른 실행
```

---

### 🥉 로컬 개발 환경 실행: macOS & Linux 자동 런처 (`start.sh`)

macOS (Apple Silicon M1/M2/M3/M4 및 Intel Mac)와 Linux 환경에서는 POSIX 런처 스크립트를 사용하여 손쉽게 구동할 수 있습니다:

```bash
chmod +x ./start.sh
./start.sh
# 또는 npm 스크립트로 실행:
npm run start:mac
```

런처 스크립트 기능:
1. macOS 아키텍처 자동 감지 (`arm64` Apple Silicon vs `x86_64` Intel Mac)
2. Docker, OrbStack, Colima 또는 Homebrew PostgreSQL 서비스 자동 감지 및 기동
3. `.env` 환경 변수 누락 시 자동 생성
4. Prisma 클라이언트 생성 (`darwin`, `darwin-arm64` 바이너리 지원) 및 마이그레이션
5. Next.js 개발 서버 실행 (`http://localhost:3000`)

#### macOS / Linux 런처 실행 옵션:
```bash
./start.sh --verify-only  # 서버 실행 없이 백엔드 및 Vitest 무결성 검증만 수행
./start.sh --seed         # 기본 위기 자원 및 샘플 데이터 시딩 적용
./start.sh --prod         # 프로덕션 빌드 후 프로덕션 모드로 서버 구동
./start.sh --port 8080    # 사용자 지정 포트로 서버 구동
```

---

## 수동 설치 및 실행 방법 (Manual Setup)

### 1. 환경 변수 구성
`.env.example` 파일을 복사하여 `.env`를 생성합니다:
```bash
cp .env.example .env
```

주요 필수 환경 변수 설정:
```env
DATABASE_URL="postgresql://46hz:46hz@localhost:5432/46hz_letterbox?schema=public"
ADMIN_PASSCODE="local-admin"
MODERATOR_PASSCODE="local-moderator"
AI_PROVIDER="mock" # 옵션: mock | openai | deepseek | gemini | claude | custom
```

### 2. PostgreSQL 데이터베이스 실행
Docker Compose를 사용하는 경우:
```bash
docker compose up -d
```

또는 경량 WSLC(WSL Container CLI)를 사용하는 경우:
```bash
wslc run -d --name 46hz-postgres -p 127.0.0.1:5432:5432 -e POSTGRES_USER=46hz -e POSTGRES_PASSWORD=46hz -e POSTGRES_DB=46hz_letterbox -v 46hz_postgres_data:/var/lib/postgresql/data postgres:16-alpine
```

### 3. 패키지 설치 및 데이터베이스 초기화
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

### 4. 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`에 접속합니다 (기본 한국어 인터페이스로 실행됩니다).

---

## Arm64 및 멀티 아키텍처 플랫폼 지원

46Hz는 Apple Silicon (M1/M2/M3/M4), AWS Graviton (aarch64), x86_64 리눅스 서버 환경에서 네이티브로 완벽하게 빌드되고 실행되도록 설계되었습니다:

- **Prisma Multi-Arch Binaries**: `prisma/schema.prisma`에 선언된 타깃:
  `binaryTargets = ["native", "linux-arm64-openssl-3.0.x", "linux-arm64-openssl-1.1.x", "linux-musl-arm64-openssl-3.0.x", "darwin-arm64"]`
- **Driver Adapter 아키텍처**: `@prisma/adapter-pg` 드라이버 어댑터를 사용하여 ARM 아키텍처 환경에서도 네이티브 C 엔진 바인딩 문제 없이 초고속 기동.
- **프로덕션 멀티 아키텍처 도커 이미지 빌드**:
  ```bash
  docker buildx build \
    --platform linux/amd64,linux/arm64 \
    -t 46hz-letterbox:latest .
  ```

---

## 보안 강화 및 데이터 최소화 규정 준수 (Security & Compliance)

- **인메모리 슬라이딩 윈도우 Rate Limiting**:
  - 관리자 로그인: 5분당 최대 5회 시도 제한
  - 편지 작성: 분당 최대 10회 생성 제한
  - AI 답장 코칭: 분당 최대 10회 요청 제한
- **엄격한 HTTP 보안 헤더**: 자동화된 CSP(Content Security Policy), HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin` 적용.
- **GDPR 및 사법 공조 데이터 최소화 (`46HZ-LE-PACKET-V1`)**:
  - 네트워크 IP 로그는 **14일 롤링 보관 기간** 경과 시 데이터베이스에서 영구 자동 소멸됩니다.
  - 익명 세션당 최근 접속 IP는 최대 5개까지만 보관됩니다.
  - 법원 영장이나 정당한 사법기관 요청 시, 개인 식별 정보 없이 암호학적 해시(SHA-256)와 최소화된 접속 메타데이터만을 담은 표준화된 JSON 감사 패킷을 안전하게 추출합니다.

---

## 시스템 품질 보증 및 검증 (Verification & QA)

코드베이스의 완벽성을 보장하기 위해 다음 검증 파이프라인을 실행합니다:

```bash
# 1. 22개 자동화 테스트 스위트 (142개 테스트) 전체 실행
npm run test:run

# 2. TypeScript 엄격 타입 검사 (에러 0건)
npm run lint

# 3. 7단계 엔드투엔드 백엔드 도메인 무결성 검증
npm run verify:backend

# 4. Next.js 프로덕션 최적화 빌드 컴파일
npm run build
```

---

## 기여 및 라이선스 (License)

본 프로젝트는 **GNU Affero General Public License v3.0 (AGPL-3.0-or-later)**을 따릅니다. 자세한 내용은 [LICENSE](./LICENSE) 파일을 참고하세요.
