# 46Hz v0.2.0 — "EXIT" Crisis Support Refresh, Complete Korean/Multilingual AI & Tag Localization, and Live Settings Studio

> **"어떤 짙은 안개 속에서도, 당신을 위한 초록빛 비상구(EXIT)는 언제나 켜져 있어요"**  
> *A quiet, human-centered anonymous emotional support slow letterbox.*

46Hz의 두 번째 메이저 릴리스(**v0.2.0**)를 배포합니다.  
이번 **v0.2.0**은 첫 안정화 버전이었던 **v0.1.0** 이후 진행된 모든 아키텍처 업그레이드(Node.js 26, PostgreSQL 19, Prisma 7+8 공존, macOS 지원, `/admin/settings` 스튜디오)를 통합하고, 위기 지원 페이지를 영화 `<엑시트(EXIT)>` 모티프의 **"EXIT: 지원 정보"**로 전면 리프레시함과 동시에 **AI 코칭·공명 매칭·감정/상황 태그를 포함한 전 영역 100% 한글화 및 3개 국어(`ko_KR`, `en_US`, `zh_CN`) 로컬라이제이션**을 완성한 릴리스입니다.

---

## 📊 v0.1.0 vs v0.2.0 핵심 비교 (Release Comparison)

| 영역 | v0.1.0 (First Stable) | v0.2.0 (EXIT & Full Localization) |
| :--- | :--- | :--- |
| **위기 지원 페이지 (`/support-resources`)** | 정적인 텍스트 중심의 기본 위기 상담 목록 | 영화 `<엑시트>` 모티프 **"EXIT: 지원 정보"** 전면 개편 · 우상향 기울임 `EXIT` + `T` 하단 ISO 7010 비상구 픽토그램 엠블럼 · `··· −−− ···` SOS 카드 · **4-7-8 호흡 안정 가이드** |
| **국내 기관 심사 대응 (KR 전용 모드)** | 한국(KR)·중국(CN) 핫라인 상시 혼재 노출 | 관리자 설정(`enableChinaSupportInfo`, 기본값 `false`)으로 **중국 대륙 지원 정보 노출 토글** 지원 — 국내 관계 기관 심사 시 대한민국(109, 1393, 1577-0199, 1388) 전용 화면 제공 |
| **감정·상황 태그 및 AI 톤 플래그 UX** | `#lonely`, `#overwhelmed`, `work`, `judgmental` 등 영문 슬러그 직접 노출 | `formatTag` · `formatToneFlag` 도입으로 **`#외로움`, `#버거움·번아웃`, `직장·일`, `단정적·지시적 표현`** 등 사용자 언어로 100% 실시간 변환 |
| **AI 공감 미들웨어 다국어 완성도** | 일부 코칭 조언(`suggestions`) 및 공명 매칭 사유(`matchReasons`) 영문 반환 | 답장 코칭 제안, 3가지 힐링 톤 리프레이밍, 공명 매칭 사유, 4가지 감정별(`번아웃/불안/외로움/자책`) 글감 마중물, 개인정보 마스킹(`[연락처 비공개]` 등) **한국어·영어·중국어 완벽 대응** |
| **다국어 로케일 사전 규모** | 기본 UI 문구 중심 (~470개 키) | 전체 35개 TSX 컴포넌트·에러·스크린 리더(`aria-label`, `sr-only`)·핫라인 디렉토리 전수 추출 (**총 612개 키, 3개 국어 100% 대칭**) |
| **시스템 설정 관리 (`/admin/settings`)** | 코드(`settings.ts`) 직접 수정 필요 | 웹 기반 **통합 시스템 설정 스튜디오(`/admin/settings`)** 제공 — 저장 시 런타임 메모리 및 루트 `settings.ts` 실시간 코드 동기화 |
| **런타임 & 데이터베이스 스택** | Node.js 20+, Prisma 7, PostgreSQL 16 | **Node.js 26**, **PostgreSQL 19 Beta**, **Prisma 7 (`7.10.0`) + Prisma 8 RC (`8.0.0-rc.23`) Side-by-Side 아키텍처**, macOS (`start.sh`) 네이티브 지원 |
| **품질 검증 (Vitest)** | 20개 스위트 / 127개 테스트 통과 | 20개 스위트 / **133개 테스트 전체 통과** + `tsc --noEmit` 무결점 검증 |

---

## 🌟 v0.2.0 주요 신규 기능 및 개선 사항 (What's New in v0.2.0)

### 1. "EXIT: 지원 정보" 전면 리프레시 및 비상구 엠블럼 (`components/exit-sign-emblem.tsx`)
- **시그니처 EXIT 엠블럼**: 오른쪽 위로 힘차게 기울어진(`-11deg`) `EXIT` 타이포그래피와 알파벳 `T` 바로 아래 결합된 국제 표준 녹색 비상구 픽토그램(ISO 7010 E001 러닝맨 + 비상문 + 방향 화살표)을 커스텀 SVG 컴포넌트로 구현했습니다.
- **3단계 EXIT 구호 가이드 & 4-7-8 호흡 안정 위젯**:
  1. *잠시 멈추고 숨 고르기* (인터랙티브 에메랄드 호흡 가이드 애니메이션 탑재)
  2. *구조 신호 보내기 (`··· −−− ···`)* (109 및 1393 원터치 긴급 전화 연결)
  3. *초록빛 비상구로 걸어 나오기* (24시간 전문 상담 기관 디렉토리 연결)
- **국내 관계 기관 심사 최적화 (`enableChinaSupportInfo`)**:
  - 기본값을 `false`(비활성)로 설정하여 첫 화면에서 대한민국 공식 핫라인(자살예방 상담전화 `109`, 보건복지상담센터 `1393`, 정신건강 위기상담 `1577-0199`, 청소년 상담전화 `1388`)만 깔끔하게 표시합니다.
  - 필요 시 `/admin/settings`에서 서버 재시작 없이 즉시 중국 대륙(CN) 핫라인 표시를 켜거나 끌 수 있습니다.

### 2. AI 공감 미들웨어 및 태그 시스템 한글화 완성
- **감정·상황 태그 및 톤 플래그 현지화 (`lib/i18n/translator.ts`)**:
  - 데이터베이스와 AI 파이프라인 내부에서는 정규화된 슬러그(`lonely`, `overwhelmed`, `work`, `judgmental` 등)를 유지하면서, 화면 렌더링 시 `formatTag()`와 `formatToneFlag()`를 통해 `#외로움`, `#버거움·번아웃`, `#위로가필요한`, `직장·일`, `과도한 조언 위주` 등 자연스러운 한국어(및 영어·중국어)로 표시합니다.
- **AI 답장 코칭 및 공명 매칭 한국어 품질 강화 (`lib/ai/mock.ts`, `lib/ai/llm.ts`)**:
  - 답장 작성자의 현재 UI 언어(`locale`)를 기준으로 AI 코칭 제안문, 따뜻한 대체 답장문, 3가지 힐링 톤 리프레이밍(`온화한 공감`, `경청 중심`, `차분한 지지`), 공명 매칭 추천 사유가 출력되도록 개선했습니다.
  - 편지 쓰기 화면의 AI 첫 문장 마중물(`WritingSparksHelper`)에서 4가지 감정 상태(`지침 / 번아웃`, `불안 / 막막함`, `외로움 / 고립감`, `자책 / 부끄러움`) 모두에 대해 세심한 맞춤형 마중물 문장과 추천 태그를 제공합니다.

### 3. 전 영역 무결점 다국어(i18n) 아키텍처 (612개 번역 키)
- `app/` 및 `components/` 내 모든 페이지, 관리자 설정 폼(`AdminSettingsForm`), 에러/로딩/404 화면, 서버 액션 에러 메시지, 스크린 리더 전용 레이블(`aria-label`, `sr-only`)까지 하드코딩된 문자열을 전수 추출하여 `ko_KR`, `en_US`, `zh_CN` 사전에 1:1 매핑했습니다.
- 기본 시드 데이터(`prisma/seed.ts`) 및 날짜 포맷터(`formatDate`) 역시 한국어(`ko-KR`) 기본 환경에 맞춰 현지화했습니다.

### 4. 관리자 실시간 시스템 설정 스튜디오 (`/admin/settings`)
- 관리자가 웹 대시보드에서 브랜드 정체성, 슈만 공명 답장 상한(7→15), 15분 답장 선점 시간, 속도 제한(Rate Limits), 데이터 최소화 정책, AI 공급자 설정, 중국 지원 정보 노출 여부를 수정하면 런타임 설정과 루트 `settings.ts` 코드에 즉시 반영됩니다.

### 5. 차세대 인프라 및 빌드 최적화
- **Prisma 7 + Prisma 8 RC 공존 아키텍처**: 프로덕션 런타임 어댑터(`@prisma/client` 7.10.0)와 차세대 선언적 스키마 검증(`prisma` 8.0.0-rc.23)을 분리 구성하고, `npm run purge:modules`로 `.next/standalone`의 불필요한 바이너리를 자동 정리합니다.
- **macOS 네이티브 지원**: `start.sh`를 통해 macOS(Apple Silicon & Intel) 환경에서 원클릭 검증 및 구동을 지원합니다.

---

## 🚀 빠른 시작 (Quick Start)

```bash
# Docker Compose 원클릭 실행
docker compose up -d

# 로컬 개발 서버 실행
npm install
npx prisma7 generate
npm run dev
```

- **웹 애플리케이션**: `http://localhost:3000`
- **EXIT: 지원 정보**: `http://localhost:3000/support-resources`
- **관리자 설정 스튜디오**: `http://localhost:3000/admin/settings` (기본 암호: `local-admin`)
