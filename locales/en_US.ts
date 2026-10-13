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
  "reply.send": "Send to moderation",
  "reply.skipClaim": "Put back in letterbox for others",
  "reply.startOver": "Start over",
  "reply.title": "Write a reply",
  "reply.yourReply": "Your reply",

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
  "theme.system": "System"
};
