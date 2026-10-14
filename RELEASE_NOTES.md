# 46Hz v0.1.0 — First Stable Release

> **"마음의 주파수를 띄우는 조용한 익명 정서 지원 편지통"**  
> *A quiet, human-centered anonymous emotional support slow letterbox.*

46Hz의 첫 번째 정식 안정화 버전(**v0.1.0**)을 배포합니다.  
지나치게 빠르고 자극적인 현대 디지털 소통에서 벗어나, 지구의 고유 주파수(슈만 공명 7.83Hz의 조화 파동인 **46Hz**)처럼 조용하고 따뜻한 위로가 오갈 수 있는 느린 편지 공간을 구현했습니다.

---

## 🌟 주요 기능 및 혁신 (Key Features)

### 1. 슈만 공명 조화 답장 상한제 (Schumann Resonance Harmonic Cap)
- **기본 7개 (7차 조화파)**: 편지 한 통에 최대 7개의 답장만 도달하여 작성자가 감정적 과부하를 겪지 않도록 보호합니다.
- **작성자 동의 기반 15개 확장 (15차 조화파)**: 작성자가 더 많은 동료의 위로를 원할 때 자발적으로 15개까지 공명 한도를 확장할 수 있습니다.

### 2. 15분 동시성 선점 및 양보 프로토콜 (15-Minute Concurrency Claiming Lease)
- 여러 이용자가 같은 편지에 동시에 답장을 작성하다가 충돌하거나 노력이 낭비되는 문제를 원천 차단합니다.
- 답장을 작성하기 시작하면 **15분간 전용 선점 락(Lease)**이 부여되며, 언제든 다른 동료에게 양보(`양보하고 다른 편지 읽기`)할 수 있습니다.

### 3. 프라이버시 보호형 AI 감성 지능 (Pluggable Empathetic AI)
- **실시간 개인정보 비식별화 (PII Anonymizer)**: 이름, 전화번호, 이메일, 주소 등을 감지하여 자동으로 제거합니다.
- **글감 마중물 (Writing Sparks)**: 마음이 막막할 때 감정을 부드럽게 열어주는 3가지 글감 질문을 제안합니다.
- **답장 코칭 및 3가지 어조 리프레이밍 (Reply Coach)**: 충고나 평가 대신 공감 중심의 언어로 다듬을 수 있도록 공감 레이더 및 3가지(공감적, 따뜻한 경청, 다정한 지지) 문장을 안내합니다.
- **의미 기반 공명 매칭 (Semantic Resonance Matcher)**: 작성자의 감정 상태와 가장 깊게 공명할 수 있는 답장자를 연결합니다.
- **자유로운 AI 공급자 교체**: `mock`부터 `openai`, `deepseek` 등 표준 호환 LLM으로 환경 변수(`AI_PROVIDER`) 하나로 교체 가능합니다.

### 4. 배리어 프리 웹 접근성 완벽 준수 (KWCAG 2.2 / KS X 9256)
- 4대 원칙(인식의 용이성, 운용의 용이성, 이해의 용이성, 견고성) 100% 충족.
- 모든 버튼 최소 44×44px 터치 영역, 스크린 리더용 본문 바로가기(`skip-to-content`), WAI-ARIA 실시간 알림 영역(`aria-live`), 고대비 다크/라이트 테마 지원.

### 5. 편지 구절 감정 메모 및 코멘트 (Passage Notes & Comments)
- 편지를 다 읽은 후 마음에 와닿은 구절을 선택하여 따뜻한 한 줄 코멘트와 감정 반응을 남길 수 있습니다.

### 6. 사법기관 준법 대응 및 데이터 최소화 (Data Minimization & Compliance Packet)
- **롤링 14일 보관 주기**: IP 및 접속 로그는 최대 14일 경과 시 물리적 자동 파기됩니다.
- **법적 대응 패킷 생성기**: 사법기관의 적법한 영장 집행 시 불필요한 개인정보 노출 없이 최소한의 암호화 검증 패킷(`46HZ-LE-PACKET-V1`)만을 발급합니다.

### 7. 관리자 다중 역할 기반 접근 제어 (Admin RBAC)
- 시스템 전체 설정을 관리하는 **Admin(`local-admin`)**과 유해 콘텐츠 및 신고를 심사하는 **Moderator(`local-moderator`)** 역할을 분리하여 운영 안정성을 극대화했습니다.

---

## 🚀 빠른 시작 (Quick Start via Docker Compose)

복잡한 개발 도구 설치 없이, Docker만 설치되어 있다면 **단 한 줄의 명령어로 즉시 구동**할 수 있습니다.

```bash
# 1. docker-compose.yml 다운로드 및 컨테이너 실행
docker compose up -d

# 2. 브라우저에서 접속
# 웹 애플리케이션: http://localhost:3000
# 관리자 포털:     http://localhost:3000/admin (암호: local-admin)
```

---

## 🛠 시스템 아키텍처 및 기술 스택

- **Frontend & Fullstack**: Next.js 16.4 (App Router, Turbopack, Standalone Output)
- **Runtime & Language**: Node.js 20+ / TypeScript 7 / React 19
- **ORM & Database**: Prisma 7 + PostgreSQL 16
- **Architecture Support**: Multi-arch 지원 (`linux/amd64`, `linux/arm64`, macOS Apple Silicon)
- **Styling**: Tailwind CSS v4 (Quiet, Tactile Stationery Theme)
- **License**: GNU Affero General Public License v3.0 (AGPL-3.0-or-later)

---

## 📦 검증 및 품질 지표 (Quality Metrics)

- **단위 및 통합 테스트**: 20개 테스트 스위트, **127개 테스트 전체 통과** (`vitest`)
- **백엔드 무결성 검증**: 7단계 아키텍처 파이프라인 무결성 100% 통과
- **타입 안정성**: TypeScript 무결점 검사 완료 (`tsc --noEmit`)
- **라이브 헬스 프로브**: `/api/health` PostgreSQL 지연 시간(latencyMs) 및 서비스 상태 실시간 모니터링
