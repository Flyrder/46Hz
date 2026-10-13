# 46Hz UI/UX Design System & Emotional Aesthetics Manual

> **Product**: 46Hz Letterbox MVP (v0.1.0)  
> **Aesthetic Archetype**: Quiet, Warm Stationery & Human-Centered Calm Technology  
> **Core Frequency**: ~46Hz (Earth's 7th Schumann Harmonic)  
> **Last Updated**: 2026-10-12  

---

## 1. Emotional Philosophy & Calm Tech

46Hz is an anonymous, human-to-human slow letterbox for quiet hearts. Unlike modern social feeds designed around dopamine loops, read receipts, and rapid-fire comments, 46Hz is engineered around **emotional holding, intentional pacing, and psychological safety**.

### 1.1 The 46Hz Schumann Resonance Metaphor
- **Earth's 7th Harmonic (~45.9Hz $\approx$ 46Hz)**: The natural electromagnetic pulse of Earth's ionosphere has a fundamental frequency of ~7.83Hz, with its 7th harmonic peaking near 46Hz.
- **7-Reply Harmonic Protection**: Each letter in 46Hz is held to **at most 7 replies by default**. This intentional constraint protects vulnerable writers from emotional noise, advice overload, and comment flooding.
- **Deep Harmonic Expansion (15 Cap)**: Only when the author feels emotionally grounded and ready for more replies can they consciously choose to expand the letter's capacity to 15 replies via the Schumann resonance meter.

### 1.2 Physical Letterbox Holding (Anti-Shadowban Design)
- **15-Minute Quiet Writing Lease**: When a peer begins drafting a response, the letter is quietly held for 15 minutes to prevent collision with other responders.
- **Transparent Human Metaphor**: Instead of confusing lockouts or amber "System Lock" badges that can trigger anxiety or feelings of being shadowbanned, peers see a warm notice: *"Another peer is currently reading and thoughtfully writing a reply..."*
- **Voluntary Release**: Responders can click *"Put back in letterbox"* at any time to return the letter to the pool for others.

---

## 2. Design Tokens & Color Palette

### 2.1 Color Tokens
The color palette combines natural stone, warm paper stationery, calming botanical sage/teal, and midnight slate:

| Token | Light Mode (Warm Stone / Ecru) | Dark Mode (Midnight Slate) | Psychological Function |
|---|---|---|---|
| `--background` | `hsl(38 26% 96%)` (`#FAF7F2`) | `hsl(222 24% 8%)` (`#0F131A`) | Warm parchment in daylight; deep calming midnight slate at night without harsh 100% black. |
| `--surface` | `hsl(0 0% 100%)` (`#FFFFFF`) | `hsl(222 20% 12%)` (`#181F2A`) | Pure card paper elevation with subtle tactile borders. |
| `--surface-paper` | `hsl(38 30% 98%)` (`#FCFAF7`) | `hsl(222 18% 14%)` (`#1C2431`) | Letter writing container background simulating stationery paper. |
| `--foreground` | `hsl(218 22% 17%)` (`#222834`) | `hsl(214 24% 92%)` (`#E7ECF3`) | Charcoal ink in light mode; soft silvery-white in dark mode for relaxed contrast. |
| `--muted` | `hsl(216 18% 92%)` | `hsl(222 14% 17%)` | Subtle pill and divider surfaces. |
| `--muted-foreground` | `hsl(218 12% 43%)` | `hsl(218 14% 65%)` | Secondary meta-labels and timestamps. |
| `--border` | `hsl(216 16% 85%)` | `hsl(222 14% 22%)` | Delicate, non-aggressive boundaries. |
| `--accent` | `hsl(168 38% 34%)` (`#35796E`) | `hsl(168 46% 46%)` (`#3DBBA5`) | Grounding sage/teal accent evoking stillness and natural growth. |
| `--accent-foreground` | `hsl(0 0% 100%)` | `hsl(222 26% 8%)` | High-contrast label color on accent surfaces. |
| `--warning` | `hsl(38 88% 46%)` | `hsl(38 88% 54%)` | Gentle amber for sensitive notices. |
| `--danger` | `hsl(356 65% 48%)` | `hsl(356 70% 60%)` | Soft rose/coral for errors and crisis warnings. |

### 2.2 Elevation & Tactile Shadows
- `--shadow-soft`: `0 16px 50px -35px rgba(54, 44, 34, 0.35)` — general soft elevation for cards.
- `--shadow-tactile`: `0 8px 30px -10px rgba(54, 44, 34, 0.12), 0 2px 6px -1px rgba(0, 0, 0, 0.04)` — hover elevation state.
- `--shadow-paper`: `0 1px 3px rgba(0, 0, 0, 0.04), 0 14px 40px -12px rgba(54, 44, 34, 0.15)` — letter container stationery shadow.

---

## 3. Typography & Micro-interactions

### 3.1 Typography
- Font Family: System sans stack with Korean typographic optimization (`ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans KR", sans-serif`).
- Body Line-Height: `leading-relaxed` (1.625) to `leading-loose` (2.0) across all letter reading and drafting surfaces.
- Letter Spacing: Tightened headings (`tracking-tight`) paired with natural, breathable body copy (`tracking-normal`).

### 3.2 Micro-interactions
- **Active State Scale**: Buttons and interactive pills subtly depress on click (`active:scale-[0.98]` or `active:scale-95`).
- **Resonance Pulse (`schumann-pulse`)**: The active Schumann harmonic node features a gentle breathing glow animation (2.4s cubic-bezier rhythm).
- **Tactile Card Lift**: Letter cards lift slightly on hover (`hover:-translate-y-0.5 hover:shadow-tactile hover:border-accent/40`) with cubic-bezier transitions.

---

## 4. Component Architecture Guide

### 4.1 Navigation Shell (`components/app-shell.tsx`)
- Frosted glass sticky header (`backdrop-blur-md bg-background/85 border-b border-border/70`).
- Brand badge featuring frequency wave insignia (`Waves`) and subtitle pill.
- Integrated language dropdown and 3-way sliding pill theme toggle (`PreferenceForm`).
- Permanent accessible skip link (`#main-content`) for keyboard and screen reader accessibility.
- Calming footer with Schumann resonance explanation, zero-PII assurance, and crisis helplines shortcut.

### 4.2 Letter Writing Workbench (`components/letter-editor.tsx`)
- Lined stationery paper container (`stationery-paper`).
- Real-time character counter showing progress toward the 40-character threshold with smooth color transitions.
- Emotional reflection sparks (inspiration chips) allowing writers to begin with gentle prompts in Korean, English, or Simplified Chinese.
- Privacy guarantee callout explaining that the letter will be anonymized by AI before final submission.

### 4.3 Schumann Resonance Meter (`components/resonance-meter.tsx`)
- Earth's Schumann harmonic frequency markers (`7.8Hz`, `14.3Hz`, `20.8Hz`, `27.3Hz`, `33.8Hz`, `39.0Hz`, `45.9Hz` up to 15th harmonic).
- Visual status: Completed harmonics filled in calming sage, active node pulsing gently, pending nodes outlined.
- Accessible ARIA progressbar with live region readout (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`).
- Author-only expandable consent button to expand capacity to 15 replies.

### 4.4 AI Reply Coach Workbench (`components/reply-composer.tsx`)
- Supportive drafting textarea with live character counter (min 20 characters).
- Empathetic guidance copy discouraging unsolicited advice or diagnosis.
- AI coaching reveal: Non-judgmental suggestion cards with checkmark guidance, detected flags explained with care, and the reviewed coached text ready for author editing.

### 4.5 Letter Postcard (`components/letter-card.tsx`)
- Stationery postcard aesthetic with delicate borders and rounded-2xl geometry.
- Metadata row: status badge, risk badge, harmonic badge, and timestamp.
- Footer pills: desired reply type, emotional hashtags, and reply count indicator.

---

## 5. Barrier-Free Accessibility (KWCAG 2.2 / KS X 9256:2024 Standards)

46Hz is architected to fully comply with **KWCAG 2.2 (한국형 웹 콘텐츠 접근성 지침 2.2 / 국가표준 KS X 9256:2024)** and W3C WCAG 2.2 AA guidelines across all 4 core principles:

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
   - 유효성 검사 실패 시 `aria-invalid="true"`, `role="alert"`, `aria-describedby`를 통해 스크린리더에 에러 즉시 음성 출력.

### 5.4 견고성 (Robustness)
1. **WAI-ARIA 1.2 시맨틱 랜드마크**:
   - `role="banner"` (헤더), `role="navigation"` (내비게이션), `role="main"` (본문), `role="contentinfo"` (푸터), `role="progressbar"` (슈만 공명 메터).
2. **스크린리더 실시간 라이브 리전 (Live Regions)**:
   - 실시간 글자수 카운터 및 공명 노드 변경에 `aria-live="polite"` 적용.
   - 스크린리더(TalkBack, VoiceOver, 센스리더, NVDA, Windows Narrator) 전방위 음성 낭독 지원.
