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
  "reply.resonanceFullDesc":
    "这封信已收到充足温暖的舒曼谐波共鸣回响。感谢你的善意与陪伴，请先看看其他同样需要温热回音的信件吧。",
  "reply.resonanceFullTitle": "共鸣已圆满",
  "reply.send": "提交审核",
  "reply.skipClaim": "放回信箱（留给其他同伴）",
  "reply.startOver": "重新开始",
  "reply.title": "撰写回信",
  "reply.yourReply": "你的回信",

  // Schumann Resonance Harmonic Mechanics
  "resonance.defaultDesc":
    "当前处于默认的 7 次舒曼谐波共鸣保护中，避免信息过载打扰内心的平静。当你准备好接纳更多关怀时，可随时在下方扩展至 15 次回响。",
  "resonance.expandButton": "开启更深共鸣（扩展至15次回响）",
  "resonance.expandedBadge": "15次深层共鸣",
  "resonance.expandedDesc":
    "已根据你的心意开启 15 次深层共鸣模式。",
  "resonance.fulfilledBadge": "共鸣圆满",
  "resonance.fulfilledDesc":
    "所有共鸣席位均已温暖填满。请静心翻阅同伴们留给你的每一段回响。",
  "resonance.meterLabel": "共鸣谐波 ({current} / {max})",
  "resonance.schumannNote":
    "46Hz 象征着地球-电离层空腔在电离层有限电导率与自然衰减（Damping）实测下形成的第7阶舒曼共振峰（~45.9Hz），而非简单的算术倍增。为避免情绪过载并让心意温和沉淀，信件默认由7封共鸣回信守护。",
  "resonance.title": "46Hz 舒曼共鸣",

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
  "theme.system": "跟随系统",

  // Additional UI & Emotional Pacing Translations
  "letter.backToInbox": "返回回信箱",
  "letter.peerReplyTitle": "同伴的回信",
  "letter.replyFeedbackTitle": "给回信的温润反馈",
  "onboarding.startSession": "开启匿名会话",
  "reply.aiHint": "✨ 草拟完成后，AI回信教练将提供温润的润色建议。",
  "reply.coachEditableNote": "您可以自由微调润色后的内容，带着温情寄出。",
  "reply.counter": "{current} / 最少{min}字",
  "reply.draftEncouragement": "无需匆忙。不必试图改变对方的心情，仅是温润倾听与接纳，便是最深切的抚慰。",
  "reply.peerReplyTitle": "同伴的回信",
  "reply.poolTitle": "同伴回信连接池",
  "resonance.expandNote": "46Hz（默认第7阶共振）→ 扩展至第15阶深层共振",
  "review.directlyEditable": "支持直接修改",
  "review.moderationNotice": "审核通过后将安全送达回信箱。",
  "review.supportConnected": "将为您连接专业咨询与援助资源。",
  "review.supportNoticeTitle": "安心保护引导说明",
  "settings.profileTitle": "匿名档案信息",
  "settings.subtitle": "管理您的匿名档案与偏好设置。",
  "write.counter": "{current} / 最少{min}字",
  "write.peacePacing": "无需匆忙，按照您的节奏落笔即可。",
  "write.privacyAssurance": "46Hz承诺保护您的隐私。信件提交后，AI将自动过滤姓名、联系方式等敏感信息，您可在下一步自由编辑确认。",
  "write.sparks": "心绪灵感（点击开启）",

  // Refined Complete Localization Keys
  "home.schumannBadge": "46Hz · 地球第七谐波舒曼共振",
  "home.browseLetters": "浏览待回信件",
  "home.pillar1Title": "7封舒曼共振限额",
  "home.pillar1Desc":
    "每封信默认最多仅接收7封温润回信，隔绝泛滥的评价与噪音，让温暖如舒曼共振般深沉入心。",
  "home.pillar2Title": "15分钟专注锁信机制",
  "home.pillar2Desc":
    "当同伴开始写信时，信件将为您静置15分钟，避免多人重复撞车，让回信者心无旁骛。",
  "home.pillar3Title": "零隐私与无账户转移码",
  "home.pillar3Desc":
    "无需手机或邮箱注册，仅凭46HZ转移码在设备间迁移。连接记录遵循GDPR原则14天内彻底清除。",
  "home.stepsSubtitle": "不疾不徐的四步慢速旅程",
  "home.step1Desc": "在完全没有催促的私密空间中，写下心中的重量。",
  "home.step2Desc": "AI滤除姓名与敏感信息，生成由您自主确认的去隐私草稿。",
  "home.step3Desc": "温暖的人工巡查守护边界，确保彼此不受二次伤害。",
  "home.step4Desc": "在专注的宁静时光里，一封不带偏见的真诚回信悄然抵达。",
  "home.crisisTitle": "正在经历紧急的情绪危机吗？"
  ,
  "home.crisisDesc":
    "46Hz非医疗或紧急救援平台。如遇紧急困难，请随时查阅24小时专业危机援助热线。",
  "home.crisisButton": "查看援助资源",

  "shell.skipToContent": "跳至主要内容",
  "shell.tagline": "慢速心绪回信箱",
  "shell.footerDesc":
    "地球第七谐波舒曼共振频率（~46Hz）。以最多7封克制回信守护心绪，全匿名温润同行。",
  "shell.crisisLink": "紧急援助资源",

  "write.prompt1": "最近独自承受的那些心绪",
  "write.prompt2": "从未对人诉说的心里话",
  "write.prompt3": "不需要说教，只想被静静倾听",
  "write.prompt4": "给今天疲惫的自己的一封信",

  "reply.writingPaceNote": "按照您的步调，写下一封满怀温情的回信。",
  "review.aiDraftNotice": "这是AI整理后的去隐私版本信件。若有不妥之处，可直接修改后再行寄出。",

  "resources.helplineBadge": "24/7 专业危机热线",
  "resources.title": "专业援助资源",
  "resources.intro":
    "匿名信件无法替代紧急或危险情况下的即时救助。此处汇集了值得信赖的外部专业危机援助渠道。",
  "resources.highRiskNotice":
    "您的信件未发送给同伴回复者。如果您正处于困难中，请联系身边信任的人或寻求以下专业机构的援助。",
  "resources.website": "官方网站",
  "resources.empty": "暂无配置生效的援助资源。",

  "resonance.capBadge": "7封基本共振限额",
  "resonance.frequencySubtitle": "(~46Hz 地球舒曼共振频率)",
  "resonance.progressAria": "已收到 {current} / {max} 封共振回信",
  "resonance.seventhBadge": "7阶共振",

  "common.copy": "复制",
  "common.copied": "已复制！",
  "common.errorTitle": "出现了一些问题",
  "common.returnHome": "返回首页",

  "admin.navMetrics": "运营指标",
  "admin.navLetters": "信件管理",
  "admin.navReplies": "回信管理",
  "admin.navReports": "举报处理",
  "admin.navUsers": "用户管理",
  "admin.navResources": "援助资源",
  "admin.navCompliance": "司法合规",
  "admin.navLog": "审核日志",
  "admin.adminOnlyBadge": "(仅管理员)",
  "admin.staffAccessTitle": "工作人员登录",
  "admin.staffAccessSubtitle": "请输入管理员或巡查员密码以继续。",
  "admin.passcodeLabel": "访问密码",
  "admin.passcodePlaceholder": "管理员或巡查员密码",
  "admin.enterDashboard": "进入控制台",
  "admin.rateLimited": "登录尝试次数过多，请5分钟后再试。",
  "admin.invalidPasscode": "密码错误，请核实凭证。",
  "admin.dashboardTitle": "46Hz 运营仪表盘",
  "admin.dashboardSubtitle": "实时信箱监控与安全指标",
  "admin.roleBadge": "当前角色: {role}",
  "admin.logout": "退出登录",

  // Letter Deletion & Author Controls
  "letter.delete": "删除信件",
  "letter.deleteConfirmTitle": "确定要删除这封信件吗？",
  "letter.deleteConfirmDesc": "信件以及所有已收到的温暖回信将被永久删除，且无法恢复。",
  "letter.deleteConfirmButton": "确认删除",
  "letter.deleteSuccess": "信件已安全删除。",
  "letter.submitSuccess": "信件已成功提交投递。",

  // Letter & Draft Comparison (Diff)
  "letter.viewModeAria": "选择信件查看模式",
  "letter.viewProcessed": "整理版",
  "letter.viewRaw": "撰写原稿",
  "letter.viewComparison": "对照比较",
  "letter.rawDraftBadge": "作者专属原稿",
  "letter.processedBadge": "公开整理版",
  "letter.copyRaw": "复制原稿",
  "letter.restoreRaw": "恢复原稿内容",
  "letter.restoredNotice": "原稿已恢复",

  // Review Page Diff & Comparison
  "review.comparisonTitle": "原稿与 AI 整理版对照审阅",
  "review.tabProcessed": "AI 整理版（可编辑）",
  "review.tabRaw": "查看撰写原稿",
  "review.tabComparison": "并排对照比较",
  "review.rawNotice": "这是您最初撰写的原稿。个人身份信息与不妥措辞已由 AI 安全脱敏整理。",
  "review.comparisonHint": "请对比左侧原稿与右侧 AI 整理版。如有需要，您可在发送前直接编辑修改内容。",
  "review.editInEditor": "在整理版标签页中修改",
  "write.privacyAssuranceBadge": "AI 安全脱敏已生效",

  // Letter Passage Comments
  "comment.title": "信件段落批注与随感",
  "comment.subtitle": "可划选信件中触动心弦的段落，记录下您的思绪与感悟。",
  "comment.badge": "{count} 条",
  "comment.add": "添加段落批注",
  "comment.commentOnSelection": "对所选段落写批注",
  "comment.selectedQuote": "选中的信件段落",
  "comment.quotePlaceholder": "想要记录的信中语句（可选）",
  "comment.contentLabel": "我的随感与笔记",
  "comment.placeholder": "请写下您对这一段落的所思所想或心声...",
  "comment.submit": "保存批注",
  "comment.emptyTitle": "暂无段落批注",
  "comment.emptyBody": "划选信件正文中的语句，即可留下专属的笔记与感悟。",
  "comment.delete": "删除批注",

  // AI Writing Sparks
  "write.aiSparksTitle": "AI 写作灵感火花",
  "write.aiSparksDesc": "当千言万语不知从何说起时，AI 为你送来温润的开篇第一句话。",
  "write.aiSparksGet": "获取灵感",
  "write.aiSparksLoading": "正在凝聚灵感...",
  "write.aiSparksMoodBurnout": "疲惫 / 倦怠",
  "write.aiSparksMoodAnxious": "焦虑 / 迷茫",
  "write.aiSparksMoodLonely": "孤单 / 寂寥",
  "write.aiSparksMoodAshamed": "内疚 / 自责",
  "write.aiSparksInsert": "用此句开头",

  // Reply Coach Workbench & Tone Radar
  "reply.toneRadar": "AI 语调诊断雷达",
  "reply.empathyScore": "共情指数",
  "reply.gentlenessScore": "温润度",
  "reply.nonJudgmentalScore": "非评判性",
  "reply.reframingTitle": "三种疗愈语调一键重构",
  "reply.reframingDesc": "点击下方任意语调，即可一键替换并应用到回复文本框中。",
  "reply.appliedNotice": "已应用",

  // Semantic Resonance Matcher
  "reply.aiResonanceRecommended": "AI 语义共鸣推荐",
  "reply.aiResonanceBadge": "共鸣推荐",
  "reply.aiResonanceReason": "与你的回复关怀偏好具有高契合度与疗愈共振。",

  // Admin Emotion Climate Radar
  "admin.emotionRadarTitle": "情感气象雷达 (Emotion Climate Radar)",
  "admin.emotionRadarDesc": "实时纵览信箱集群的集体情绪分布与疗愈舒缓指标。",
  "admin.emotionRadarLonely": "孤独",
  "admin.emotionRadarAnxious": "焦虑",
  "admin.emotionRadarOverwhelmed": "倦怠",
  "admin.emotionRadarSad": "悲伤",
  "admin.emotionRadarTotalAnalyzed": "已分析信件总数"
};
