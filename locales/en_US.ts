import type { Translations } from "@/lib/i18n/types";

export const enUS: Translations = {
  // Account & Auth
  "account.create": "Create account",
  "account.createHelp": "Save this session with an email and password.",
  "account.email": "Email",
  "account.errorExists": "An account with that email already exists.",
  "account.errorInvalid": "Email or password was not recognized.",
  "account.handle": "Display handle",
  "account.password": "Password",
  "account.signIn": "Sign in",
  "account.signInHelp": "Return to an account you already saved.",
  "account.signOut": "Sign out",
  "account.title": "Account",

  // Common & Navigation
  "age.adult": "18+",
  "age.under18": "Under 18",
  "common.cancel": "Cancel",
  "common.optionalReason": "Optional reason",
  "common.report": "Report",
  "language.label": "Language",
  "nav.account": "Account",
  "nav.admin": "Admin",
  "nav.inbox": "Inbox",
  "nav.settings": "Settings",
  "nav.write": "Write",

  // Home Page
  "home.body":
    "46Hz helps people write anonymous support letters, routes unsafe content away from peers, and keeps human replies gentle through review.",
  "home.openInbox": "Open inbox",
  "home.stepsTitle": "Today's letterbox",
  "home.step1": "Write privately",
  "home.step2": "AI clarifies and anonymizes",
  "home.step3": "Admin reviews",
  "home.step4": "A peer replies",
  "home.title": "A quiet place to send a difficult letter.",
  "home.write": "Write a letter",

  // Onboarding & Device Migration
  "onboarding.ageRange": "Age range",
  "onboarding.create": "Create anonymous session",
  "onboarding.replyPreference": "Replies you generally prefer",
  "onboarding.subtitle":
    "Only broad preferences are used. No real name, phone number, precise location, school, or workplace is requested.",
  "onboarding.title": "Begin anonymously",
  "onboarding.restoreTitle": "Restore Session",
  "onboarding.restoreHelp": "Enter your Migration Code to transfer your profile to this device.",
  "onboarding.restorePlaceholder": "46HZ-XXXX-XXXX",
  "onboarding.restoreButton": "Restore",
  "onboarding.errorInvalidCode": "The migration code was not recognized.",

  // Letter Writing & Review
  "write.label": "Letter text",
  "write.placeholder": "Dear someone, I have been carrying...",
  "write.review": "Review letter",
  "write.subtitle":
    "Share what feels hard right now. The next screen will show an editable, anonymized version before anything is submitted.",
  "write.title": "Write a letter",
  "review.editable": "Editable anonymized version",
  "review.noDraftBody": "Start with a fresh letter when you are ready.",
  "review.noDraftTitle": "No draft to review",
  "review.routeSupport": "Route to support",
  "review.safetyRouted":
    "This letter will not be sent to peer responders. After confirmation, it will route to support resources instead.",
  "review.submit": "Submit to moderation",
  "review.title": "Review before submitting",

  // Inbox & Letter Detail
  "inbox.emptyRepliesBody":
    "Approved letters that can receive peer support are available in the reply area.",
  "inbox.emptyRepliesTitle": "No replies sent",
  "inbox.emptyLettersBody":
    "When you write a letter, it will appear here with its moderation status.",
  "inbox.emptyLettersTitle": "No letters yet",
  "inbox.findLetter": "Find a letter",
  "inbox.replyContext": "For a letter asking for {type}.",
  "inbox.sentReplies": "Replies you sent",
  "inbox.subtitle": "Replies arrive after moderation. There is no live thread.",
  "inbox.title": "Inbox",
  "letter.approvedReplies": "Approved replies",
  "letter.masked":
    "This letter was routed away from peer response. Support resources are available instead.",
  "letter.noPeerRepliesBody":
    "This letter was handled by safety routing, so it is not shown to peer responders.",
  "letter.noPeerRepliesTitle": "Peer replies are closed",
  "letter.noRepliesBody":
    "Your letter is safely in the letterbox. Once a peer writes a reply, it will appear here after warm moderation review.",
  "letter.noRepliesTitle": "No replies yet",
  "letter.title": "Your letter",

  // Reply Workbench & Human-centered Protection
  "reply.alreadyRepliedDesc":
    "Thank you for your warmth! Your reply has been submitted for review and will be delivered to the writer once approved. You can view your sent replies in your inbox anytime.",
  "reply.alreadyRepliedTitle": "You have already replied to this letter",
  "reply.browseOtherLetters": "Browse other letters",
  "reply.coach": "Coach reply",
  "reply.coachSuggestions": "Reply coach suggestions",
  "reply.final": "Final reply",
  "reply.flags": "Flags: {flags}",
  "reply.guidance":
    "Let the writer's feelings be real. Avoid diagnosis, certainty, pressure, and excessive advice unless advice was requested.",
  "reply.inboxLink": "View in inbox",
  "reply.noLettersBody":
    "The peer pool is empty right now, or all available letters need moderation.",
  "reply.noLettersTitle": "No letters available",
  "reply.opportunitiesSubtitle":
    "A few approved letters are available at a time. High-risk letters are not shown here.",
  "reply.opportunitiesTitle": "Reply to a letter",
  "reply.placeholder": "Write as if you are placing a letter back in the box.",
  "reply.reservedByOtherDesc":
    "To ensure each letter receives thoughtful, unhurried attention without duplicate replies, a peer is currently reading and drafting a response. The letter is gently held for {minutes} minutes while they write. If they step away, it will return to the letterbox automatically.",
  "reply.reservedByOtherTitle": "A peer is currently writing a reply to this letter",
  "reply.reservedForYou": "Writing reply · {minutes}m quiet focus",
  "reply.resonanceFullDesc":
    "This letter has reached its full Schumann resonance harmonic capacity with heartfelt replies. Thank you for your care—feel free to browse other letters waiting for a gentle voice.",
  "reply.resonanceFullTitle": "Resonance limit reached",
  "reply.send": "Send to moderation",
  "reply.skipClaim": "Put back in letterbox for others",
  "reply.startOver": "Start over",
  "reply.title": "Write a reply",
  "reply.yourReply": "Your reply",

  // Schumann Resonance Harmonic Mechanics
  "resonance.defaultDesc":
    "Protected by the default 7 Schumann harmonic replies to prevent emotional overwhelm. If you feel ready to receive more care, you can expand to 15 replies below.",
  "resonance.expandButton": "Open deeper resonance (expand to 15 replies)",
  "resonance.expandedBadge": "15th harmonic resonance",
  "resonance.expandedDesc":
    "Expanded to receive up to 15 resonant replies upon your choice.",
  "resonance.fulfilledBadge": "Resonance complete",
  "resonance.fulfilledDesc":
    "All resonance slots have been peacefully fulfilled. Take your time reading through each message.",
  "resonance.meterLabel": "Resonance Harmonics ({current} / {max})",
  "resonance.schumannNote":
    "46Hz represents Earth's 7th Schumann resonance mode (~45.9Hz) as empirically observed in the Earth-ionosphere cavity with natural ionospheric damping, rather than a naive linear multiplier. To prevent emotional overwhelm and let words settle gently, letters are held within 7 resonance replies by default.",
  "resonance.title": "46Hz Schumann Resonance",

  // Reply Preferences & Types
  "replyType.ADVICE": "Gentle advice",
  "replyType.COMFORT": "Comfort",
  "replyType.JUST_BEING_HEARD": "Just being heard",
  "replyType.SIMILAR_EXPERIENCES": "Similar experiences",

  // Feedback
  "feedback.feltUnderstood": "I felt understood",
  "feedback.helpful": "This helped",
  "feedback.judgmental": "This felt judgmental",
  "feedback.saved": "Feedback saved.",
  "feedback.save": "Save feedback",
  "feedback.tooMuchAdvice": "This was too much advice",

  // Settings & Preferences
  "settings.anonymousHandle": "Anonymous handle",
  "settings.leave": "Leave session",
  "settings.preferences": "Preferences",
  "settings.replyPreference": "Reply preference",
  "settings.save": "Save preferences",
  "settings.trustScore": "Trust score",
  "settings.migrationCode": "Migration Code",
  "settings.migrationCodeHelp": "Keep this code secret. Use it to load this session on another device.",
  "settings.title": "Settings",

  // Status Labels
  "status.APPROVED": "Approved",
  "status.BLOCKED": "Blocked",
  "status.DRAFT": "Draft",
  "status.HIGH": "High",
  "status.NORMAL": "Normal",
  "status.PENDING": "Pending",
  "status.REJECTED": "Rejected",
  "status.ROUTED_TO_SUPPORT": "Routed to support",
  "status.SENSITIVE": "Sensitive",

  // Themes
  "theme.dark": "Pure dark",
  "theme.label": "Theme",
  "theme.light": "Light",
  "theme.system": "System",

  // Additional UI & Emotional Pacing Translations
  "letter.backToInbox": "Back to inbox",
  "letter.peerReplyTitle": "Peer Reply",
  "letter.replyFeedbackTitle": "Feedback on this reply",
  "onboarding.startSession": "Start Anonymous Session",
  "reply.aiHint": "✨ After drafting, AI Coach offers gentle refinement suggestions.",
  "reply.coachEditableNote": "Feel free to refine the coached thoughts before sending with warmth.",
  "reply.counter": "{current} / min {min} chars",
  "reply.draftEncouragement": "Take your time. A gentle reply that listens without trying to fix or judge offers the deepest comfort.",
  "reply.peerReplyTitle": "Peer Reply",
  "reply.poolTitle": "Peer Reply Connections",
  "resonance.expandNote": "46Hz (Default 7th Harmonic) → 15th Deep Harmonic Expansion",
  "review.directlyEditable": "Directly Editable",
  "review.moderationNotice": "Will be placed in the letterbox after moderation.",
  "review.supportConnected": "You will be connected to support resources.",
  "review.supportNoticeTitle": "Safety Care Routing Notice",
  "settings.profileTitle": "Anonymous Profile",
  "settings.subtitle": "Manage your anonymous profile and application preferences.",
  "write.counter": "{current} / min {min} chars",
  "write.peacePacing": "Take all the time you need. There is no rush.",
  "write.privacyAssurance": "46Hz protects your privacy. When submitted, AI cleans names and contact info; you will review and edit the anonymized draft before it is confirmed.",
  "write.sparks": "Inspiration Sparks (Click to begin)",

  // Refined Complete Localization Keys
  "home.schumannBadge": "46Hz · Earth's 7th Schumann Harmonic (~46Hz)",
  "home.browseLetters": "Browse letters to reply",
  "home.pillar1Title": "7th Harmonic Reply Cap",
  "home.pillar1Desc":
    "Each letter receives at most 7 harmonic replies by default, protecting writers from overwhelm and comment flooding.",
  "home.pillar2Title": "15-Min Focused Holding",
  "home.pillar2Desc":
    "When a peer begins writing, the letter is quietly held for 15 minutes, preventing collision and ensuring full focus.",
  "home.pillar3Title": "Zero PII & Crockford Code",
  "home.pillar3Desc":
    "No emails, passwords, or personal profiles. Transfer devices using Crockford Base32 codes; network traces auto-purge after 14 days.",
  "home.stepsSubtitle": "A four-step human-centered slow journey",
  "home.step1Desc": "Share what weighs on your mind without pressure or hurry.",
  "home.step2Desc": "AI filters PII and creates an editable, safe draft for your preview.",
  "home.step3Desc": "Human moderation ensures safety without cold algorithms.",
  "home.step4Desc": "A peer responder writes with unhurried care and gentle presence.",
  "home.crisisTitle": "Experiencing an immediate crisis?",
  "home.crisisDesc":
    "46Hz is not a clinical or emergency service. If you are in crisis, access 24/7 dedicated professional helplines.",
  "home.crisisButton": "View Support Resources",

  "shell.skipToContent": "Skip to main content",
  "shell.tagline": "Slow Letterbox",
  "shell.footerDesc":
    "Earth's 7th Schumann harmonic frequency (~46Hz). A quiet anonymous emotional support letterbox capping at 7 resonant replies.",
  "shell.crisisLink": "Crisis Resources",

  "write.prompt1": "Words I've kept to myself lately",
  "write.prompt2": "Feelings that felt too heavy to carry alone",
  "write.prompt3": "Just wanting to be heard without unsolicited advice",
  "write.prompt4": "A quiet letter to my tired self today",

  "reply.writingPaceNote": "Take your time and write a gentle, heartfelt reply.",
  "review.aiDraftNotice": "Here is your anonymized draft. Feel free to revise any wording before quietly submitting.",

  "resources.helplineBadge": "24/7 Crisis Helplines",
  "resources.title": "Support Resources",
  "resources.intro":
    "Anonymous letters are not the right place for urgent or dangerous moments. These resources connect you with professional local care.",
  "resources.highRiskNotice":
    "Your letter was not sent to peer responders. Please consider reaching out to someone you trust nearby or one of the resources below.",
  "resources.website": "Website",
  "resources.empty": "No active resources have been configured yet.",

  "resonance.capBadge": "7th Harmonic Cap",
  "resonance.frequencySubtitle": "(~46Hz Earth Schumann Frequency)",
  "resonance.progressAria": "{current} of {max} harmonic replies received",
  "resonance.seventhBadge": "7 Harmonics",

  "common.copy": "Copy",
  "common.copied": "Copied!",
  "common.errorTitle": "Something needs attention",
  "common.returnHome": "Return home",

  "admin.navMetrics": "Metrics",
  "admin.navLetters": "Letters",
  "admin.navReplies": "Replies",
  "admin.navReports": "Reports",
  "admin.navUsers": "Users",
  "admin.navResources": "Resources",
  "admin.navCompliance": "Compliance (Law Enforcement)",
  "admin.navLog": "Log",
  "admin.adminOnlyBadge": "(Admin)",
  "admin.staffAccessTitle": "Staff access",
  "admin.staffAccessSubtitle": "Enter Administrator or Moderator passcode to continue.",
  "admin.passcodeLabel": "Passcode",
  "admin.passcodePlaceholder": "Admin or Moderator passcode",
  "admin.enterDashboard": "Enter dashboard",
  "admin.rateLimited": "Too many failed login attempts. Please wait 5 minutes before trying again.",
  "admin.invalidPasscode": "Invalid passcode. Please verify your staff credentials.",
  "admin.dashboardTitle": "46Hz Operations Dashboard",
  "admin.dashboardSubtitle": "Real-time letterbox monitoring and safety metrics",
  "admin.roleBadge": "Role: {role}",
  "admin.logout": "Log out",

  // Letter Deletion & Author Controls
  "letter.delete": "Delete letter",
  "letter.deleteConfirmTitle": "Delete this letter?",
  "letter.deleteConfirmDesc": "This letter and all received replies will be permanently deleted and cannot be recovered.",
  "letter.deleteConfirmButton": "Confirm delete",
  "letter.deleteSuccess": "Letter has been safely deleted.",
  "letter.submitSuccess": "Letter has been successfully submitted.",

  // Letter & Draft Comparison (Diff)
  "letter.viewModeAria": "Select letter view mode",
  "letter.viewProcessed": "Processed",
  "letter.viewRaw": "Original draft",
  "letter.viewComparison": "Compare",
  "letter.rawDraftBadge": "Author-only original",
  "letter.processedBadge": "Published processed text",
  "letter.copyRaw": "Copy original",
  "letter.restoreRaw": "Restore original text",
  "letter.restoredNotice": "Original restored",

  // Review Page Diff & Comparison
  "review.comparisonTitle": "Review draft and AI processed text",
  "review.tabProcessed": "AI Processed (Editable)",
  "review.tabRaw": "Original draft",
  "review.tabComparison": "Side-by-side comparison",
  "review.rawNotice": "This is your original draft as written. Personal identifying information and harsh expressions were safely moderated by AI.",
  "review.comparisonHint": "Compare your original draft on the left with the AI-moderated text on the right. You can edit the text before sending.",
  "review.editInEditor": "Edit in Processed tab",
  "write.privacyAssuranceBadge": "AI Anonymization Active",

  // Letter Passage Comments
  "comment.title": "Passage Comments & Notes",
  "comment.subtitle": "Select a passage from the letter to record your thoughts or reflections.",
  "comment.badge": "{count}",
  "comment.add": "Add passage comment",
  "comment.commentOnSelection": "Comment on selection",
  "comment.selectedQuote": "Selected passage",
  "comment.quotePlaceholder": "Quote or excerpt from the letter (optional)",
  "comment.contentLabel": "My thought / reflection",
  "comment.placeholder": "Share your thoughts or reflections on this passage...",
  "comment.submit": "Save comment",
  "comment.emptyTitle": "No passage comments yet",
  "comment.emptyBody": "Highlight or select any sentence in the letter to leave personal notes and reflections.",
  "comment.delete": "Delete comment",

  // AI Writing Sparks
  "write.aiSparksTitle": "AI Writing Sparks",
  "write.aiSparksDesc": "When finding the first words feels hard, let AI offer gentle opening sentences.",
  "write.aiSparksGet": "Get Sparks",
  "write.aiSparksLoading": "Crafting sparks...",
  "write.aiSparksMoodBurnout": "Burnout / Exhausted",
  "write.aiSparksMoodAnxious": "Anxious / Worried",
  "write.aiSparksMoodLonely": "Lonely / Isolated",
  "write.aiSparksMoodAshamed": "Self-blame / Heavy",
  "write.aiSparksInsert": "Start with this",

  // Reply Coach Workbench & Tone Radar
  "reply.toneRadar": "AI Tone Radar",
  "reply.empathyScore": "Empathy",
  "reply.gentlenessScore": "Gentleness",
  "reply.nonJudgmentalScore": "Non-judgmental",
  "reply.reframingTitle": "Reframe in 3 Healing Tones",
  "reply.reframingDesc": "Select any tone below to instantly apply it to your reply.",
  "reply.appliedNotice": "Applied",

  // Semantic Resonance Matcher
  "reply.aiResonanceRecommended": "AI Semantic Resonance Recommended",
  "reply.aiResonanceBadge": "Resonance Match",
  "reply.aiResonanceReason": "Strong healing resonance with your reply preference.",

  // Admin Emotion Climate Radar
  "admin.emotionRadarTitle": "Emotion Climate Radar",
  "admin.emotionRadarDesc": "Real-time emotional distribution and collective relief indicators across letterboxes.",
  "admin.emotionRadarLonely": "Loneliness",
  "admin.emotionRadarAnxious": "Anxiety",
  "admin.emotionRadarOverwhelmed": "Burnout",
  "admin.emotionRadarSad": "Sadness",
  "admin.emotionRadarTotalAnalyzed": "Total Letters Analyzed",

  // Support Resources Refresh
  "resources.emergencyBannerTitle": "24/7 Immediate Crisis Support Hotlines",
  "resources.emergencyBannerSubtitle": "If you are in distress or need someone to talk to right now, please reach out to these free, confidential 24/7 crisis hotlines. You do not have to carry this alone.",
  "resources.emergency247Badge": "24/7 Free & Confidential",
  "resources.callDirectly": "Call Hotline Directly",
  "resources.filterAll": "All Regions",
  "resources.filterKR": "Republic of Korea",
  "resources.filterCN": "Mainland China",
  "resources.filterLangAll": "All Languages",
  "resources.searchPlaceholder": "Search by title, region, or keywords...",
  "resources.showingCount": "Showing {count} support resources",
  "resources.hotlineDesc109": "South Korea 24/7 National Suicide Prevention Hotline (Dial 109, Toll-free)",
  "resources.hotlineDesc1393": "Ministry of Health & Welfare Crisis Line (Dial 1393, 24/7 Toll-free)",
  "resources.hotlineDesc1577": "Mental Health Crisis Hotline (1577-0199, Regional center linkage)",
  "resources.hotlineDesc1388": "Youth Crisis Hotline (Dial 1388, 24/7 for youth & guardians)",
  "resources.hotlineDescCN": "China National Psychological Crisis Hotline (400-161-9995 / 12355, 24/7 Free Support)",

  // Admin UI Clean-up
  "admin.metricsLettersToday": "Letters Today",
  "admin.metricsRepliesToday": "Replies Today",
  "admin.metricsPendingModeration": "Pending Moderation",
  "admin.metricsHighRisk": "High-Risk Protected",
  "admin.metricsReports": "User Reports",
  "admin.metricsUnderstoodRate": "Understood Rate",
  "admin.metricsRejectedRate": "Reply Rejection Rate",
  "admin.roleAdmin": "System Administrator",
  "admin.roleModerator": "Calm Moderator",
  "admin.lettersTitle": "Pending Letters Queue",
  "admin.repliesTitle": "Pending Replies Queue",
  "admin.reportsTitle": "User Reports Review",
  "admin.usersTitle": "Anonymous User Management",
  "admin.resourcesTitle": "Crisis Support Resources Management",
  "admin.complianceTitle": "Compliance & Data Minimization",
  "admin.logTitle": "Operational Moderation Audit Log",
  "admin.adminRequiredTitle": "Administrator Privileges Required",
  "admin.adminRequiredDesc": "User account suspension and crisis support resources management are restricted to full System Administrators (ADMIN).",
  "admin.noPendingLetters": "No letters are currently waiting for review.",
  "admin.noPendingReplies": "No replies are currently waiting for review.",
  "admin.noReports": "No user reports have been filed.",
  "admin.noLogs": "No moderation audit events recorded yet.",
  "admin.pendingLettersBadge": "{count} pending letters",
  "admin.pendingRepliesBadge": "{count} pending replies"
};
