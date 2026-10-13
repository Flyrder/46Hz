import type { Translations } from "@/lib/i18n/types";

export const zhCN: Translations = {
  // Account & Auth
  "account.create": "创建账户",
  "account.createHelp": "使用邮箱和密码保存当前会话。",
  "account.email": "电子邮箱",
  "account.errorExists": "该邮箱已被注册。",
  "account.errorInvalid": "邮箱或密码错误。",
  "account.handle": "匿名昵称",
  "account.password": "密码",
  "account.signIn": "登录",
  "account.signInHelp": "返回已保存的账户。",
  "account.signOut": "退出登录",
  "account.title": "账户",

  // Common & Navigation
  "age.adult": "18 岁及以上",
  "age.under18": "未满 18 岁",
  "common.cancel": "取消",
  "common.optionalReason": "可选原因",
  "common.report": "举报",
  "language.label": "语言",
  "nav.account": "账户",
  "nav.admin": "管理",
  "nav.inbox": "收件箱",
  "nav.settings": "设置",
  "nav.write": "写信",

  // Home Page
  "home.body":
    "46Hz 帮助人们书写匿名的情绪互助信件，将高危内容移出同伴视野，并通过审核让每一份回信温和而有力量。",
  "home.openInbox": "打开信箱",
  "home.stepsTitle": "今日信箱",
  "home.step1": "安心写下心事",
  "home.step2": "AI 辅助澄清脱敏",
  "home.step3": "管理员把关审核",
  "home.step4": "同伴温暖回信",
  "home.title": "一个可以静静寄出一封心事的地方。",
  "home.write": "写一封信",

  // Onboarding & Device Migration
  "onboarding.ageRange": "年龄段",
  "onboarding.create": "开启匿名会话",
  "onboarding.replyPreference": "更倾向的回信方式",
  "onboarding.subtitle":
    "我们仅收集必要的宽泛偏好。绝不索取真实姓名、手机号、精确定位、学校或工作单位。",
  "onboarding.title": "匿名开启旅程",
  "onboarding.restoreTitle": "恢复会话",
  "onboarding.restoreHelp": "输入此前在其他设备获得的迁移代码，将档案无缝恢复到本设备。",
  "onboarding.restorePlaceholder": "46HZ-XXXX-XXXX",
  "onboarding.restoreButton": "恢复档案",
  "onboarding.errorInvalidCode": "迁移代码无效或已失效。",

  // Letter Writing & Review
  "write.label": "信件内容",
  "write.placeholder": "致某人，最近我心里一直沉甸甸的...",
  "write.review": "审校信件",
  "write.subtitle":
    "把此刻让你难受或孤独的心事写下来。下一步会在提交前生成一份可自由编辑的脱敏版本。",
  "write.title": "写一封信",
  "review.editable": "可编辑的脱敏版本",
  "review.noDraftBody": "准备好后，可以随时写一封新信。",
  "review.noDraftTitle": "暂无待审核草稿",
  "review.routeSupport": "前往支持资源",
  "review.safetyRouted":
    "这封信涉及即时危机内容，不会分发给同伴回复。确认后将直接为您提供专业紧急援助资源。",
  "review.submit": "确认并提交审核",
  "review.title": "提交前确认",

  // Inbox & Letter Detail
  "inbox.emptyRepliesBody": "经审核通过、可以获得同伴支持的信件，会在回信广场显示。",
  "inbox.emptyRepliesTitle": "尚未寄出回信",
  "inbox.emptyLettersBody": "写下的信件会显示在这里，并展示其实时的审核流转状态。",
  "inbox.emptyLettersTitle": "信箱里暂无信件",
  "inbox.findLetter": "去信箱看看",
  "inbox.replyContext": "回复一封期望获得「{type}」的信件。",
  "inbox.sentReplies": "我寄出的回信",
  "inbox.subtitle": "回信经人工审核后送达，这里没有喧嚣的即时对话流。",
  "inbox.title": "收件箱",
  "letter.approvedReplies": "收到的回信",
  "letter.masked": "此信件已进入支持援助通道，不对同伴回信者公开。",
  "letter.noPeerRepliesBody": "该信件已由安全路由处理，不会向同伴展示。",
  "letter.noPeerRepliesTitle": "同伴回复通道已关闭",
  "letter.noRepliesBody":
    "信件正静静躺在信箱中等待同伴开启。一旦有同伴完成书写并通过审核，回信便会送达这里。",
  "letter.noRepliesTitle": "暂未收到回信",
  "letter.title": "我的信件",

  // Reply Workbench & Human-centered Protection
  "reply.alreadyRepliedDesc":
    "非常感谢您的倾听与陪伴！您撰写的回信已提交审核，审核通过后写信人就能在收件箱查收。您可以在收件箱中随时查看已发送的回信。",
  "reply.alreadyRepliedTitle": "您已经送出过温暖的回信了",
  "reply.browseOtherLetters": "浏览其他信件",
  "reply.coach": "回信辅导",
  "reply.coachSuggestions": "辅导建议",
  "reply.final": "最终回信文案",
  "reply.flags": "标记：{flags}",
  "reply.guidance":
    "请全心接纳写信人的真实感受。除非对方明确要求建议，否则避免擅自诊断、绝对化判断、施加压力或说教。",
  "reply.inboxLink": "前往收件箱",
  "reply.noLettersBody": "当前回信池暂无待回复信件，或所有信件正在审核中。",
  "reply.noLettersTitle": "暂无可回复的信件",
  "reply.opportunitiesSubtitle": "每次仅展示少量已过审信件。高风险与危机信件不会出现在这里。",
  "reply.opportunitiesTitle": "温暖回信",
  "reply.placeholder": "就像静静往信箱中投递一封信那样书写...",
  "reply.reservedByOtherDesc":
    "为了让每一位写信人的心事都能得到专注、温暖的回应，避免多人同时重复回复，当前已有一位同伴取下这封信并正在认真书写。信件会为 TA 保留 {minutes} 分钟专注时间；若对方中途离开或未完成，信件会自动放回信箱。请先看看其他同样需要陪伴的心事吧。",
  "reply.reservedByOtherTitle": "另一位同伴正在用心写信中",
  "reply.reservedForYou": "静心书写中 · 为您守护 {minutes} 分钟",
  "reply.send": "提交审核",
  "reply.skipClaim": "放回信箱（留给其他同伴）",
  "reply.startOver": "重新开始",
  "reply.title": "撰写回信",
  "reply.yourReply": "你的回信",

  // Reply Preferences & Types
  "replyType.ADVICE": "温和建议",
  "replyType.COMFORT": "暖心安慰",
  "replyType.JUST_BEING_HEARD": "倾听与陪伴",
  "replyType.SIMILAR_EXPERIENCES": "相似共鸣",

  // Feedback
  "feedback.feltUnderstood": "我感觉被理解了",
  "feedback.helpful": "这很有帮助",
  "feedback.judgmental": "有被评判的感觉",
  "feedback.saved": "反馈已保存。",
  "feedback.save": "保存反馈",
  "feedback.tooMuchAdvice": "建议有些太多了",

  // Settings & Preferences
  "settings.anonymousHandle": "匿名代号",
  "settings.leave": "退出当前会话",
  "settings.preferences": "偏好设置",
  "settings.replyPreference": "偏好的回应风格",
  "settings.save": "保存偏好",
  "settings.trustScore": "同伴信任分",
  "settings.migrationCode": "设备迁移代码",
  "settings.migrationCodeHelp": "请妥善保管此代码。您可以在新设备或新浏览器中凭此代码完整恢复数据。",
  "settings.title": "设置",

  // Status Labels
  "status.APPROVED": "已通过",
  "status.BLOCKED": "已拦截",
  "status.DRAFT": "草稿",
  "status.HIGH": "高风险",
  "status.NORMAL": "正常",
  "status.PENDING": "待审核",
  "status.REJECTED": "已驳回",
  "status.ROUTED_TO_SUPPORT": "已转入援助资源",
  "status.SENSITIVE": "敏感",

  // Themes
  "theme.dark": "纯深色",
  "theme.label": "主题",
  "theme.light": "浅色模式",
  "theme.system": "跟随系统"
};
