# 46Hz v0.2.2 — Multi-Architecture Container Build Stabilization, Native Platform Cross-Compilation & MCP Protocol Endpoint

> **"크로스 아키텍처 멀티 플랫폼 빌드 안정화, 모델 컨텍스트 프로토콜(MCP) 개방 및 전 계층 최적화"**  
> *A quiet, human-centered anonymous emotional support slow letterbox.*

46Hz의 프로덕션 컨테이너 빌드 안정화 및 기능 고도화 릴리스(**v0.2.2**)를 배포합니다.  
이번 **v0.2.2**는 v0.2.1의 서체 번들링, 운영 캘린더, 세부 AI 제어에 이어, **Docker Buildx 기반 멀티 아키텍처(`linux/amd64`, `linux/arm64`) 컨테이너 빌드 파이프라인의 네이티브 크로스 컴파일 최적화**, **Model Context Protocol(MCP) 표준 엔드포인트(`/api/mcp`) 탑재**, **클라이언트 컴포넌트 `useI18n` 훅 경계 분리를 통한 RSC 직렬화 오버헤드 해소**, **Gemini 2.5 Native Interactions API 연동 및 생각(Thinking)/저장소 제어**를 완성했습니다.

---

## 📊 v0.2.1 vs v0.2.2 핵심 비교 (Release Comparison)

| 영역 | v0.2.1 (Typography & Ops Calendar) | v0.2.2 (Buildx Native Multi-Arch & MCP Endpoint) |
| :--- | :--- | :--- |
| **컨테이너 빌드 파이프라인** | QEMU 에뮬레이션 빌드로 arm64 Prisma 엔진 크래시 발생 가능 | **`--platform=$BUILDPLATFORM` 네이티브 빌드 최적화** — QEMU 병목 제거, 빌드 시간 10분→2분 단축, `debian-openssl-3.0.x` 타깃 보강 |
| **에이전트 연동 인터페이스** | REST API 위주의 내부 엔드포인트 | **Model Context Protocol(MCP) JSON-RPC 2.0 엔드포인트 (`/api/mcp`)** 신설 — 외부 AI 에이전트/도구와의 표준화된 도구 호출 및 상태 조회 지원 |
| **클라이언트 i18n 런타임** | RSC 서버 컴포넌트에서 클라이언트로 번역 함수 전달 시 함수 직렬화 경고 | **클라이언트 전용 `useI18n` 훅 적용** (`components/admin-settings-form.tsx`) — RSC 경계 간 순수 상태만 전달하여 렌더링 안정성 확보 |
| **운영자 설정 UI** | 폼 하단 설정 프리뷰 배치 불균형 | 저장/초기화 버튼 정렬 및 `settings.ts` 실시간 JSON 프리뷰 하단 재배치로 가시성 극대화 |
| **AI 공급자 심층 제어** | 기본 모델 및 파라미터 제어 | Gemini Interactions API 전용 함수 프롬프트, Thinking Budget, 컨텍스트 스토어 제어 및 실시간 연결 테스트 |
| **품질 검증 (Vitest)** | 22개 스위트 / 142개 테스트 통과 | **28개 스위트 / 169개 테스트 전체 통과 (100%)** + `tsc --noEmit` 무결점 검증 |

---

## 🌟 v0.2.2 주요 신규 기능 및 개선 사항 (What's New in v0.2.2)

### 1. 멀티 아키텍처 컨테이너 빌드 네이티브 최적화 (`Dockerfile` & `prisma/schema.prisma`)
- **`--platform=$BUILDPLATFORM` 네이티브 크로스 빌드**: `Dockerfile`의 `dependencies`와 `builder` 스테이지에 빌더 호스트 네이티브 플랫폼을 지정하여, QEMU aarch64 에뮬레이션 중에 발생하던 Prisma Rust 바이너리(`schema-engine`)의 크래시 및 10분 이상의 빌드 지연을 원천 해결했습니다.
- **`debian-openssl-3.0.x` 바이너리 타깃 보강**: `prisma/schema.prisma`의 `binaryTargets`에 `debian-openssl-3.0.x`를 추가하여 Debian Bookworm 베이스 이미지 기반 amd64 컨테이너와 arm64 컨테이너 모두에서 완벽한 런타임 호환성을 제공합니다.
- **엔진 바이너리 번들링 보장**: 빌더 단계에서 컴파일 및 다운로드된 멀티 아키텍처 Prisma 엔진을 최종 러너 이미지에 정확히 복사하도록 경로를 보정했습니다.

### 2. Model Context Protocol (MCP) 표준 엔드포인트 (`/api/mcp`)
- Claude Desktop, Gemini CLI, Cursor 등 현대적인 AI 코딩 및 오케스트레이션 도구에서 46Hz 서비스의 편지/답장 통계 및 상태를 직접 조회하고 조작할 수 있는 **MCP (Model Context Protocol) JSON-RPC 2.0 규격 엔드포인트**를 정식 지원합니다.
- Prisma 8 PSL 데이터 계약(Contract) 무결성 검증 도구와 통합되어 외부 도구에서도 스키마 일관성을 검증할 수 있습니다.

### 3. 클라이언트 컴포넌트 RSC 함수 직렬화 경계 해소
- `app/admin/settings/page.tsx` 등 서버 컴포넌트에서 클라이언트 폼으로 i18n 번역 함수 `t`를 직접 props로 넘기던 구조를 개선했습니다.
- 클라이언트 컴포넌트 내부에서 `useI18n()` 훅을 직접 호출하도록 분리하여, Next.js Server-to-Client 컴포넌트 경계에서 함수 직렬화로 인한 런타임 경고 및 잠재적 렌더링 충돌을 제거했습니다.

### 4. 관리자 UI 정밀 정렬 및 Gemini 심층 제어
- `/admin/settings`의 설정 저장 및 기본값 복원 버튼의 시각적 정렬을 다듬고, `settings.ts` 라이브 프리뷰를 폼 하단으로 재배치하여 설정 변경에 따른 실시간 코드 동기화를 한눈에 확인할 수 있습니다.
- Gemini 2.5 Native Interactions API 연동 규격을 완성하여, 기능별 시스템 프롬프트 분리와 확장 생각(Extended Thinking) 버짓을 직접 제어할 수 있습니다.

---

## 📜 지난 릴리스 히스토리 (Release Archive)

### 46Hz v0.2.1 (2026-10-17)
- 네이버 나눔스퀘어라운드 및 마루 부리 서체 로컬 번들링 (`/fonts`)
- 오픈소스 라이선스 투명성 공시 페이지 (`/licenses` 및 `THIRD_PARTY_NOTICES.md`)
- 관리자 인터랙티브 운영 캘린더 뷰 (`AdminCalendarView`) 및 클릭형 메트릭 심층 드릴다운 네비게이션
- AI 마스터 스위치(`enableAi`) 및 5대 세부 모듈 독립 제어 스튜디오 (`/admin/settings`)
- AI 추천 위기 자원 원클릭 즉시 삭제/정리 서버 액션 탑재

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
# Docker Compose 원클릭 실행 (v0.2.2 멀티 아키텍처 지원)
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
- **MCP 엔드포인트**: `http://localhost:3000/api/mcp`
