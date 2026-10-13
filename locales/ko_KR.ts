import type { Translations } from "@/lib/i18n/types";

export const koKR: Translations = {
  // Account & Auth
  "account.create": "계정 만들기",
  "account.createHelp": "이 계정을 이메일과 비밀번호로 저장합니다.",
  "account.email": "이메일",
  "account.errorExists": "이미 해당 이메일의 계정이 있습니다.",
  "account.errorInvalid": "이메일 또는 비밀번호를 확인할 수 없습니다.",
  "account.handle": "표시 이름",
  "account.password": "비밀번호",
  "account.signIn": "로그인",
  "account.signInHelp": "저장한 계정으로 돌아옵니다.",
  "account.signOut": "로그아웃",
  "account.title": "계정",

  // Common & Navigation
  "age.adult": "19세 이상",
  "age.under18": "19세 미만",
  "common.cancel": "취소",
  "common.optionalReason": "선택 사유",
  "common.report": "신고",
  "language.label": "언어",
  "nav.account": "계정",
  "nav.admin": "관리",
  "nav.inbox": "받은함",
  "nav.settings": "설정",
  "nav.write": "쓰기",

  // Home Page
  "home.body":
    "46Hz는 익명의 응원 편지를 쓰고, 안전하지 않은 내용은 또래에게 보이지 않게 라우팅하며, 답장이 부드럽게 유지되도록 검토합니다.",
  "home.openInbox": "받은함 열기",
  "home.stepsTitle": "오늘의 편지함",
  "home.step1": "비공개로 작성",
  "home.step2": "AI가 정리하고 익명화",
  "home.step3": "관리자 검토",
  "home.step4": "또래가 답장",
  "home.title": "조용히 마음고민을 보낼 수 있는 곳",
  "home.write": "편지 쓰기",

  // Onboarding & Device Migration
  "onboarding.ageRange": "나이 범위",
  "onboarding.create": "익명 계정 만들기",
  "onboarding.replyPreference": "선호하는 답장",
  "onboarding.subtitle":
    "민감한 개인정보는 편지에 포함하지 마시고, 편히 적어보세요",
  "onboarding.title": "익명으로 시작하기",
  "onboarding.restoreTitle": "계정 복구",
  "onboarding.restoreHelp": "이전 기기에서 발급받은 전송코드를 입력하여 계정을 이 기기로 가져옵니다.",
  "onboarding.restorePlaceholder": "46HZ-XXXX-XXXX",
  "onboarding.restoreButton": "복구하기",
  "onboarding.errorInvalidCode": "전송코드가 올바르지 않거나 만료되었습니다.",

  // Letter Writing & Review
  "write.label": "편지 내용",
  "write.placeholder": "요즘 마음에 담아두었던 이야기는...",
  "write.review": "편지 검토하기",
  "write.subtitle":
    "지금 마음을 무겁게 하는 것을 편하게 적어보세요. 제출 전 익명화된 버전을 확인하고 수정할 수 있어요.",
  "write.title": "편지 쓰기",
  "review.editable": "수정 가능한 익명화 버전",
  "review.noDraftBody": "준비되면 새 편지부터 시작하세요.",
  "review.noDraftTitle": "검토할 초안이 없습니다",
  "review.routeSupport": "지원 자료로 이동",
  "review.safetyRouted":
    "이 편지는 또래 응답자에게 전달되지 않습니다. 확인 후 지원 자료로 바로 안내됩니다.",
  "review.submit": "검토 후 제출",
  "review.title": "제출 전 검토",

  // Inbox & Letter Detail
  "inbox.emptyRepliesBody": "또래 응원을 받을 수 있는 승인된 편지는 답장 영역에 표시됩니다.",
  "inbox.emptyRepliesTitle": "보낸 답장이 없습니다",
  "inbox.emptyLettersBody": "편지를 쓰면 검토 상태와 함께 이곳에 표시됩니다.",
  "inbox.emptyLettersTitle": "아직 편지가 없습니다",
  "inbox.findLetter": "편지 찾기",
  "inbox.replyContext": "{type}을(를) 원하는 편지에 대한 답장입니다.",
  "inbox.sentReplies": "내가 보낸 답장",
  "inbox.subtitle": "답장은 검토 후 도착합니다. 실시간 대화방은 없습니다.",
  "inbox.title": "받은함",
  "letter.approvedReplies": "승인된 답장",
  "letter.masked": "이 편지는 또래 답장에서 제외되었습니다. 대신 지원 자료를 이용할 수 있습니다.",
  "letter.noPeerRepliesBody": "안전 라우팅으로 처리되어 또래 응답자에게 표시되지 않습니다.",
  "letter.noPeerRepliesTitle": "또래 답장이 닫혔습니다",
  "letter.noRepliesBody": "편지가 편지함에 안전하게 놓여 있습니다. 동료가 편지를 읽고 답장을 적어 보내면 관리자의 따뜻한 검토를 거쳐 여기에 도착합니다.",
  "letter.noRepliesTitle": "아직 도착한 답장이 없습니다",
  "letter.title": "내 편지",

  // Reply Workbench & Human-centered Protection
  "reply.alreadyRepliedDesc":
    "이 편지에 전해주신 마음에 깊이 감사드립니다! 작성해 주신 답장은 검토를 거쳐 작성자의 받은 편지함으로 전달됩니다. 보낸 답장은 내 받은함에서 언제든 확인하실 수 있습니다.",
  "reply.alreadyRepliedTitle": "이미 따뜻한 답장을 보내셨어요",
  "reply.browseOtherLetters": "다른 편지 둘러보기",
  "reply.coach": "답장 코칭",
  "reply.coachSuggestions": "답장 코치 제안",
  "reply.final": "최종 답장",
  "reply.flags": "표시: {flags}",
  "reply.guidance":
    "쓴 사람의 감정이 그대로 존재하도록 받아주세요. 요청하지 않은 진단, 확신, 압박, 과한 조언은 피합니다.",
  "reply.inboxLink": "받은함으로 이동",
  "reply.noLettersBody": "지금 또래 편지 풀이 비어 있거나 가능한 편지가 아직 검토 중입니다.",
  "reply.noLettersTitle": "가능한 편지가 없습니다",
  "reply.opportunitiesSubtitle": "한 번에 몇 개의 승인된 편지만 표시됩니다. 고위험 편지는 보이지 않습니다.",
  "reply.opportunitiesTitle": "편지에 답장하기",
  "reply.placeholder": "편지함에 답장을 다시 넣는 마음으로 써 주세요.",
  "reply.reservedByOtherDesc":
    "한 사람의 마음에 온전히 집중하고 답장이 중복되지 않도록, 지금 다른 동료가 편지를 소중히 읽고 있습니다. 작성에 집중할 수 있도록 편지는 {minutes}분 동안 조용히 보관되며, 작성을 마치지 않거나 자리를 비우면 자동으로 편지함에 다시 채워집니다.",
  "reply.reservedByOtherTitle": "다른 동료가 편지를 읽고 답장을 적고 있어요",
  "reply.reservedForYou": "편지 작성 중 · {minutes}분간 작성 보호",
  "reply.resonanceFullDesc":
    "이 편지는 이미 슈만 공명에 따른 따뜻한 답장들로 채워졌습니다. 작성자에게 깊은 위로가 되었을 거예요. 다른 편지를 둘러보며 따뜻한 마음을 나누어 보세요.",
  "reply.resonanceFullTitle": "공명이 가득 찼습니다",
  "reply.send": "검토로 보내기",
  "reply.skipClaim": "편지함에 다시 넣기 (다른 사람에게 양보)",
  "reply.startOver": "다시 시작",
  "reply.title": "답장 쓰기",
  "reply.yourReply": "내 답장",

  // Schumann Resonance Harmonic Mechanics
  "resonance.defaultDesc":
    "기본 7개의 공명 답장 보호가 적용 중입니다. 더 많은 동료들의 마음을 받아들일 준비가 되셨다면, 아래 버튼을 눌러 언제든 15개로 공명을 확장할 수 있습니다.",
  "resonance.expandButton": "더 깊은 공명 열기 (최대 15개로 확장)",
  "resonance.expandedBadge": "15차 확장 공명",
  "resonance.expandedDesc":
    "작성자의 선택으로 더 깊은 15개의 공명 모드가 열려 있습니다.",
  "resonance.fulfilledBadge": "공명 완결",
  "resonance.fulfilledDesc":
    "모든 공명이 가득 찼습니다. 편지에 전해진 소중한 마음들을 편안히 읽어보세요.",
  "resonance.meterLabel": "공명 하모닉스 ({current} / {max})",
  "resonance.schumannNote":
    "46Hz는 지구의 7차 슈만 공명 주파수(~46Hz)를 상징합니다. 편지가 감정적 과부하에 빠지지 않고 온전히 마음에 닿을 수 있도록 기본 7개의 공명 답장으로 보호됩니다.",
  "resonance.title": "46Hz 슈만 공명",

  // Reply Preferences & Types
  "replyType.ADVICE": "부드러운 조언",
  "replyType.COMFORT": "위로",
  "replyType.JUST_BEING_HEARD": "그냥 들어주기",
  "replyType.SIMILAR_EXPERIENCES": "비슷한 경험",

  // Feedback
  "feedback.feltUnderstood": "이해받는 느낌이 들었어요",
  "feedback.helpful": "도움이 되었어요",
  "feedback.judgmental": "단정짓는 느낌이 들었어요",
  "feedback.saved": "피드백이 저장되었습니다.",
  "feedback.save": "피드백 저장",
  "feedback.tooMuchAdvice": "조언이 너무 많았어요",

  // Settings & Preferences
  "settings.anonymousHandle": "익명 핸들",
  "settings.leave": "로그아웃",
  "settings.preferences": "환경설정",
  "settings.replyPreference": "선호하는 답장",
  "settings.save": "환경설정 저장",
  "settings.trustScore": "신뢰 점수",
  "settings.migrationCode": "전송코드",
  "settings.migrationCodeHelp": "이 코드를 안전하게 보관하세요. 다른 기기나 브라우저에서 계정을 불러올 때 사용합니다.",
  "settings.title": "설정",

  // Status Labels
  "status.APPROVED": "승인됨",
  "status.BLOCKED": "차단됨",
  "status.DRAFT": "초안",
  "status.HIGH": "높음",
  "status.NORMAL": "일반",
  "status.PENDING": "검토 대기",
  "status.REJECTED": "반려됨",
  "status.ROUTED_TO_SUPPORT": "지원 자료로 이동",
  "status.SENSITIVE": "주의 필요",

  // Themes
  "theme.dark": "다크 모드",
  "theme.label": "테마",
  "theme.light": "라이트 모드",
  "theme.system": "시스템 설정 따름",

  // Additional UI & Emotional Pacing Translations
  "letter.backToInbox": "받은함으로 돌아가기",
  "letter.peerReplyTitle": "익명 동료의 답장",
  "letter.replyFeedbackTitle": "답장에 대한 따뜻한 피드백",
  "onboarding.startSession": "익명 세션 시작하기",
  "reply.aiHint": "✨ 작성 후 AI 코치가 부드러운 다듬기 조언을 건네줍니다.",
  "reply.coachEditableNote": "코칭된 내용을 자유롭게 다듬은 뒤 따뜻한 마음으로 부쳐보세요.",
  "reply.counter": "{current} / {min}자 이상",
  "reply.draftEncouragement": "서두르지 마세요. 쓴 사람의 감정을 고치려 하지 않고, 있는 그대로 따뜻하게 들어주는 답장이 가장 큰 위로가 됩니다.",
  "reply.peerReplyTitle": "익명 동료의 답장",
  "reply.poolTitle": "또래 답장 연결함",
  "resonance.expandNote": "46Hz (기본 7차 공명) → 15차 심층 공명 확장",
  "review.directlyEditable": "직접 수정 가능",
  "review.moderationNotice": "승인 후 편지함에 안전하게 놓여집니다.",
  "review.supportConnected": "전문 상담 및 지원 자료로 연결됩니다.",
  "review.supportNoticeTitle": "안심 보호 라우팅 안내",
  "settings.profileTitle": "익명 프로필 정보",
  "settings.subtitle": "내 익명 프로필과 환경설정을 관리합니다.",
  "write.counter": "{current} / {min}자 이상",
  "write.peacePacing": "서두르지 마시고 편하신 속도대로 적어도 좋습니다.",
  "write.privacyAssurance": "46Hz는 안심 익명화 기술을 제공합니다. 편지를 보내면 AI가 실명, 연락처 등 민감 정보를 정돈하며, 다음 화면에서 직접 검토·수정한 뒤 최종 제출합니다.",
  "write.sparks": "마음의 시작점 (클릭하여 영감 얻기)",

  // Refined Complete Localization Keys
  "home.schumannBadge": "46Hz · 지구의 7차 슈만 공명 주파수",
  "home.browseLetters": "답장 둘러보기",
  "home.pillar1Title": "7차 슈만 공명 보호",
  "home.pillar1Desc":
    "편지당 기본 7개의 공명 답장만 허용합니다. 넘쳐나는 댓글과 소음으로부터 마음을 보호하고, 한 마디의 위로가 깊이 가닿게 합니다.",
  "home.pillar2Title": "15분 온전한 집중 보관",
  "home.pillar2Desc":
    "동료가 답장을 적는 15분 동안 편지를 조용히 보관합니다. 여러 사람이 겹쳐 쓰지 않아 한 사람의 마음에 온전히 집중할 수 있습니다.",
  "home.pillar3Title": "100% 무계정 & 제로 PII",
  "home.pillar3Desc":
    "이메일도 비밀번호도 저장하지 않습니다. 오직 46HZ 이전 코드로만 기기를 옮기며, IP 흔적은 14일 뒤 흔적 없이 소멸합니다.",
  "home.stepsSubtitle": "서두르지 않는 4단계의 따뜻한 여정",
  "home.step1Desc": "마음의 무게를 혼자 짊어지지 않고 편안하게 적어 내려갑니다.",
  "home.step2Desc": "실명이나 연락처 등 개인정보를 걸러내고 수정 가능한 초안을 만듭니다.",
  "home.step3Desc": "누구도 상처받지 않도록 안전 가이드라인을 따뜻하게 검토합니다.",
  "home.step4Desc": "15분의 조용한 집중 속에서 한 동료의 정성 어린 답장이 도착합니다.",
  "home.crisisTitle": "즉각적인 위기 상황에 처해 계신가요?",
  "home.crisisDesc":
    "46Hz는 의료·긴급 치료 서비스가 아닙니다. 지금 힘겨운 위기 상황이라면 24시간 전문 위기 상담 리소스를 확인해주세요.",
  "home.crisisButton": "전문 지원 자료 보기",

  "shell.skipToContent": "본문으로 건너뛰기",
  "shell.tagline": "느린 마음 편지함",
  "shell.footerDesc":
    "지구의 7차 슈만 공명 주파수(~46Hz). 감정의 과부하 없는 7개의 답장으로 마음을 지키는 인간 중심 익명 편지함입니다.",
  "shell.crisisLink": "위기 지원 자료",

  "write.prompt1": "요즘 혼자 삼켜야 했던 이야기",
  "write.prompt2": "누구에게도 털어놓지 못했던 속마음",
  "write.prompt3": "충고 대신 그저 묵묵한 위로가 필요할 때",
  "write.prompt4": "오늘 하루 지친 내 마음에게",

  "reply.writingPaceNote": "서두르지 않고 당신의 속도대로 따뜻한 답장을 적어주세요.",
  "review.aiDraftNotice": "AI가 정돈한 익명화 편지입니다. 마음에 들지 않는 문장이 있다면 직접 고친 뒤 부쳐주세요.",

  "resources.helplineBadge": "24/7 전문 위기 상담 안내",
  "resources.title": "전문 지원 자료",
  "resources.intro":
    "익명의 편지는 즉각적인 위험이나 위기 상황을 대체할 수 없습니다. 이 지원 자료는 신뢰할 수 있는 외부 전문 기관 목록입니다.",
  "resources.highRiskNotice":
    "편지가 또래 응답자에게 전달되지 않았습니다. 현재 힘든 상황이라면 곁에 있는 신뢰할 수 있는 사람이나 아래의 전문 지원 기관에 손을 내밀어주세요.",
  "resources.website": "웹사이트",
  "resources.empty": "아직 등록된 지원 자료가 없습니다.",

  "resonance.capBadge": "7차 기본 공명 제한",
  "resonance.frequencySubtitle": "(~46Hz 지구 슈만 공명 주파수)",
  "resonance.progressAria": "총 {max}개 공명 중 {current}개의 답장이 도착했습니다.",
  "resonance.seventhBadge": "7차 기본 공명",

  "common.copy": "복사",
  "common.copied": "복사됨!",
  "common.errorTitle": "문제가 발생했습니다",
  "common.returnHome": "홈으로 돌아가기",

  "admin.navMetrics": "지표",
  "admin.navLetters": "편지",
  "admin.navReplies": "답장",
  "admin.navReports": "신고",
  "admin.navUsers": "사용자",
  "admin.navResources": "지원 자료",
  "admin.navCompliance": "사법 공조 (컴플라이언스)",
  "admin.navLog": "로그",
  "admin.adminOnlyBadge": "(관리자 전용)",
  "admin.staffAccessTitle": "관리자 접속",
  "admin.staffAccessSubtitle": "계속하려면 관리자 또는 모더레이터 암호를 입력하세요.",
  "admin.passcodeLabel": "접속 암호",
  "admin.passcodePlaceholder": "관리자 또는 모더레이터 암호",
  "admin.enterDashboard": "대시보드 입장",
  "admin.rateLimited": "로그인 시도가 너무 많습니다. 5분 후에 다시 시도하세요.",
  "admin.invalidPasscode": "암호가 올바르지 않습니다. 관리자 권한을 확인해주세요.",
  "admin.dashboardTitle": "46Hz 운영 대시보드",
  "admin.dashboardSubtitle": "실시간 편지함 모니터링 및 안전 지표",
  "admin.roleBadge": "권한: {role}",
  "admin.logout": "로그아웃"
};
