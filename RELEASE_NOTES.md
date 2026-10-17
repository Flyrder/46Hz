# 46Hz v0.2.1 — Bundled Typography & Open-Source Licenses, Operations Calendar & Metric Deep-Dive, and Granular AI Control Studio

> **"지친 마음에 따스한 글씨로 닿는 위로, 그리고 더 투명하고 정교해진 운영의 지혜"**  
> *A quiet, human-centered anonymous emotional support slow letterbox.*

46Hz의 기능 고도화 및 운영 안정화 릴리스(**v0.2.1**)를 배포합니다.  
이번 **v0.2.1**은 v0.2.0의 EXIT 위기 지원 리프레시와 전 영역 한글화 완성에 이어, **네이버 나눔스퀘어라운드 및 마루 부리 서체 로컬 번들링(`/fonts`)과 오픈소스 라이선스 공시(`/licenses`)**, **운영자 캘린더 뷰(`AdminCalendarView`) 및 클릭형 메트릭 심층 드릴다운 네비게이션**, **AI 마스터 스위치 및 미세조정(Hyperparameter) 스튜디오**, **관리자 위기 자원 삭제 정리 액션**을 탑재하였습니다.

---

## 📊 v0.2.0 vs v0.2.1 핵심 비교 (Release Comparison)

| 영역 | v0.2.0 (EXIT & Localization) | v0.2.1 (Typography, Ops Calendar & AI Control) |
| :--- | :--- | :--- |
| **서체 및 타이포그래피** | 구글 폰트/웹 CDN 및 기본 시스템 산세리프 의존 | 네이버 **나눔스퀘어라운드** & **마루 부리** OTF 서체 로컬 번들링 (`/fonts`) — 편지 본문 및 답장에 감성 문학 세리프(`font-letter`) 적용, 오프라인 완전 구동 |
| **오픈소스 라이선스 & 규정 준수** | 루트 `LICENSE` (AGPL-3.0) 텍스트 파일만 제공 | 전용 **오픈소스 라이선스 안내 페이지 (`/licenses`)**, **`THIRD_PARTY_NOTICES.md`**, 네이버 서체 저작권 명시, Docker 컨테이너 패키징 |
| **관리자 운영 콘솔 (`/admin`, `/admin/letters`, `/admin/replies`)** | 단순 통계 숫자 카드 및 기본 리스트 뷰 | **인터랙티브 운영 캘린더 뷰 (`AdminCalendarView`)** — 일별 편지/답장 상태 집계, **클릭형 메트릭 심층 링크**, 상태/날짜별 정밀 필터링 및 3개 국어 완전 대칭 i18n |
| **AI 제어 및 미세조정 스튜디오** | Mock / DeepSeek 공급자 단순 선택 및 지연시간 설정 | **AI 마스터 스위치(`enableAi`)**, 5대 모듈별 독립 토글(위험감지/익명화/코칭/글감/공명), **Temperature · MaxTokens · Model** 런타임 제어 |
| **위기 상담 자원 관리 (`/admin/resources`)** | 수동 수정 위주의 관리 | AI 추천 생성 지원 자원 원클릭 즉시 삭제/정리 액션 탑재 |
| **품질 검증 (Vitest)** | 20개 스위트 / 133개 테스트 통과 | **22개 스위트 / 142개 테스트 전체 통과** + `tsc --noEmit` 무결점 검증 |

---

## 🌟 v0.2.1 주요 신규 기능 및 개선 사항 (What's New in v0.2.1)

### 1. 네이버 나눔스퀘어라운드 & 마루 부리 서체 로컬 번들링 (`/fonts`)
- **감성 문학 세리프 타이포그래피**: 네이버 문화재단의 **마루 부리(MaruBuri)** 서체 5종(ExtraLight, Light, Regular, SemiBold, Bold)을 번들링하여 편지 뷰어(`LetterContentViewer`)와 답장 작성 화면에 적용했습니다. 화면을 오래 바라보아도 눈이 편안하고 종이 편지지에 잉크로 쓴 듯한 따스한 감성을 제공합니다.
- **글로벌 UI 폰트 나눔스퀘어라운드**: 둥글고 다정한 **나눔스퀘어라운드(NanumSquareRound)** 4종(L, R, B, EB)을 전역 서체로 탑재하여 외부 CDN 다운로드 없이 완전 오프라인 환경에서도 일관된 시각 경험을 보장합니다.

### 2. 오픈소스 라이선스 투명성 공시 (`/licenses` 및 `THIRD_PARTY_NOTICES.md`)
- **오픈소스 공시 페이지**: `/licenses` 엔드포인트를 신설하여 46Hz 본체의 AGPL-3.0-or-later 라이선스 전문, 네이버 글꼴 라이선스(OFL/자유 이용 허락), Next.js, React, Prisma 등 주요 의존성 라이브러리의 라이선스 현황을 투명하게 안내합니다.
- **프로덕션 패키징**: `Dockerfile` 빌드 단계에서 `LICENSE`, `THIRD_PARTY_NOTICES.md`, `fonts/LICENSE.txt`를 스탠드얼론 컨테이너에 자동 복사하도록 구성했습니다.

### 3. 관리자 운영 캘린더 및 클릭형 메트릭 심층 드릴다운 (`/admin`, `/admin/letters`, `/admin/replies`)
- **인터랙티브 운영 캘린더 (`components/admin-calendar-view.tsx`)**:
  - 월 단위 탐색과 함께 일자별 총 편지/답장 수, 대기(Pending), 승인(Approved), 반려(Rejected), 위기 연계(Routed) 상태를 시각적 배지와 점으로 요약 표시합니다. 요일 헤더, 상태 범례, 툴팁까지 한국어/영어/중국어 3개 언어로 100% 완전 대칭 현지화되었습니다.
  - 특정 날짜를 클릭하면 `/admin/letters?date=YYYY-MM-DD` 및 `/admin/replies?date=YYYY-MM-DD`로 해당 날짜의 대기열만 즉시 필터링하여 모니터링할 수 있습니다.
- **원클릭 메트릭 상세 네비게이션**:
  - 대시보드 상단 7개 핵심 지표 카드(오늘 접수 편지, 오늘 작성 답장, 대기 중 편지, 고위험 감지, 신고 접수 건, 공감 피드백, 반려 답장)를 클릭형 링크로 전환하고, 하단에 상관 분석 디테일 문구를 추가했습니다.
  - 감정 레이더 분포 카드 클릭 시 해당 감정 태그(`/admin/letters?tag=...`)로 즉시 모아보기가 가능합니다.

### 4. AI 마스터 스위치 및 미세조정(Hyperparameter) 스튜디오 (`/admin/settings`)
- **AI 전체 비활성화(Master Toggle)**: `enableAi: false` 설정 시 PII 마스킹, 위험 감지, 답장 코칭, 글감 마중물 등 모든 AI 처리를 즉시 무해하게 바이패스하여 긴급 장애 상황이나 무AI 순수 모드로 운영할 수 있습니다.
- **세부 모듈별 독립 On/Off**: 위험 감지(`enableAiRiskSafety`), 개인정보 마스킹(`enableAiAnonymization`), 답장 코칭(`enableAiReplyCoach`), 글감 마중물(`enableAiWritingSparks`), 공명 매칭(`enableAiResonanceMatch`)을 독립적으로 켜고 끌 수 있습니다.
- **하이퍼파라미터 제어**: 웹 설정 스튜디오에서 Temperature(창의성 조절, 0.0~2.0), Max Tokens(최대 생성 토큰 수, 100~4000), 대상 모델명(Model, e.g. `gpt-4o-mini`, `deepseek-chat`)을 실시간으로 변경하여 `settings.ts`에 동기화할 수 있습니다.

### 5. 위기 자원 정리 액션 및 피드백 UX 개선
- **AI 지원 자원 즉시 삭제**: `/admin/resources`에서 AI가 자동 제안한 지원 자원 중 부적절하거나 중복된 항목을 운영자가 원클릭으로 안전하게 삭제할 수 있는 서버 액션을 추가했습니다.
- **편지 답장 피드백 체크박스 컴포넌트**: 편지 수신자가 답장에 대한 따뜻한 피드백을 남길 때 '충분히 이해받음', '도움이 됨', '단정적/지시적 느낌', '과도한 조언 위주'를 직관적으로 선택하고 사유를 남길 수 있도록 폼 UX를 개선했습니다.

---

## 📜 지난 릴리스 히스토리 (Release Archive)

### 46Hz v0.2.0 (2026-10-17)
- 영화 `<엑시트(EXIT)>` 모티프의 **"EXIT: 지원 정보"** 전면 리프레시 및 ISO 7010 비상구 엠블럼 (`components/exit-sign-emblem.tsx`)
- 국내 관계 기관 심사 대응용 중국 대륙 핫라인 표시 토글 (`enableChinaSupportInfo`)
- AI 공감 미들웨어 및 감정/상황 태그 100% 한글화 및 3개 국어(`ko_KR`, `en_US`, `zh_CN`) 대칭 사전 (612개 키)
- 웹 기반 관리자 실시간 시스템 설정 스튜디오 (`/admin/settings`)
- Node.js 26 + PostgreSQL 19 Beta + Prisma 7/8 공존 아키텍처 및 macOS (`start.sh`) 지원

### 46Hz v0.1.0 (2026-10-15)
- 46Hz 제7 슈만 공명 모드 기반 익명 느린 편지함 코어 MVP 배포
- 편지 작성, AI 비식별화, 또래 답장 집필, 공명 피드백 루프

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
- **오픈소스 라이선스**: `http://localhost:3000/licenses`
- **관리자 운영 센터**: `http://localhost:3000/admin` (기본 암호: `local-admin`)
- **관리자 설정 스튜디오**: `http://localhost:3000/admin/settings`
