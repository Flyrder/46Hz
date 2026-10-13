import Link from "next/link";
import {
  Inbox,
  PenLine,
  Waves,
  Clock,
  ShieldCheck,
  HeartHandshake,
  ArrowRight,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocalePreference()]);
  const t = createTranslator(locale);

  const stepKeys = [
    {
      titleKey: "home.step1",
      descKo: "마음의 무게를 혼자 짊어지지 않고 편안하게 적어 내려갑니다.",
      descEn: "Share what weighs on your mind without pressure or hurry.",
      descZh: "在完全没有催促的私密空间中，写下心中的重量。"
    },
    {
      titleKey: "home.step2",
      descKo: "실명이나 연락처 등 개인정보를 걸러내고 수정 가능한 초안을 만듭니다.",
      descEn: "AI filters PII and creates an editable, safe draft for your preview.",
      descZh: "AI滤除姓名与敏感信息，生成由您自主确认的去隐私草稿。"
    },
    {
      titleKey: "home.step3",
      descKo: "누구도 상처받지 않도록 안전 가이드라인을 따뜻하게 검토합니다.",
      descEn: "Human moderation ensures safety without cold algorithms.",
      descZh: "温暖的人工巡查守护边界，确保彼此不受二次伤害。"
    },
    {
      titleKey: "home.step4",
      descKo: "15분의 조용한 집중 속에서 한 동료의 정성 어린 답장이 도착합니다.",
      descEn: "A peer responder writes with unhurried care and gentle presence.",
      descZh: "在专注的宁静时光里，一封不带偏见的真诚回信悄然抵达。"
    }
  ];

  const getStepDesc = (item: (typeof stepKeys)[0]) => {
    if (locale === "ko_KR") return item.descKo;
    if (locale === "zh_CN") return item.descZh;
    return item.descEn;
  };

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-surface/90 p-8 sm:p-12 shadow-soft backdrop-blur-xs">
        {/* Subtle Ambient Background Gradient */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
        />

        <div className="max-w-2xl">
          {/* Schumann Frequency Ripple Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3.5 py-1 text-xs font-semibold text-accent mb-6 select-none">
            <Waves className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
            <span>
              {locale === "ko_KR"
                ? "46Hz · 지구의 7차 슈만 공명 주파수"
                : locale === "zh_CN"
                ? "46Hz · 地球第七谐波舒曼共振"
                : "46Hz · Earth's 7th Schumann Harmonic (~46Hz)"}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl sm:leading-[1.18]">
            {t("home.title")}
          </h1>

          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground font-normal">
            {t("home.body")}
          </p>

          {/* Action Button Row */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={user ? "/write" : "/onboarding"}
              className={buttonVariants("primary") + " shadow-sm text-base px-5 py-3"}
            >
              <PenLine className="h-4.5 w-4.5" aria-hidden="true" />
              <span>{t("home.write")}</span>
            </Link>

            <Link
              href="/inbox"
              className={buttonVariants("secondary") + " text-base px-5 py-3"}
            >
              <Inbox className="h-4.5 w-4.5" aria-hidden="true" />
              <span>{t("home.openInbox")}</span>
            </Link>

            <Link
              href="/reply"
              className={buttonVariants("ghost") + " text-sm text-muted-foreground hover:text-foreground"}
            >
              <HeartHandshake className="h-4 w-4 mr-1 text-accent" aria-hidden="true" />
              <span>
                {locale === "ko_KR"
                  ? "답장 둘러보기"
                  : locale === "zh_CN"
                  ? "浏览待回信件"
                  : "Browse letters to reply"}
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Core Philosophy Pillars */}
      <section aria-label="Brand Philosophy" className="grid gap-5 md:grid-cols-3">
        {/* Pillar 1 */}
        <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs transition-all hover:border-accent/40 hover:shadow-tactile">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent mb-4">
            <Waves className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold tracking-tight text-foreground">
            {locale === "ko_KR"
              ? "7차 슈만 공명 보호"
              : locale === "zh_CN"
              ? "7封舒曼共振限额"
              : "7th Harmonic Reply Cap"}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {locale === "ko_KR"
              ? "편지당 기본 7개의 공명 답장만 허용합니다. 넘쳐나는 댓글과 소음으로부터 마음을 보호하고, 한 마디의 위로가 깊이 가닿게 합니다."
              : locale === "zh_CN"
              ? "每封信默认最多仅接收7封温润回信，隔绝泛滥的评价与噪音，让温暖如舒曼共振般深沉入心。"
              : "Each letter receives at most 7 harmonic replies by default, protecting writers from overwhelm and comment flooding."}
          </p>
        </div>

        {/* Pillar 2 */}
        <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs transition-all hover:border-accent/40 hover:shadow-tactile">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent mb-4">
            <Clock className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold tracking-tight text-foreground">
            {locale === "ko_KR"
              ? "15분 온전한 집중 보관"
              : locale === "zh_CN"
              ? "15分钟专注锁信机制"
              : "15-Min Focused Holding"}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {locale === "ko_KR"
              ? "동료가 답장을 적는 15분 동안 편지를 조용히 보관합니다. 여러 사람이 겹쳐 쓰지 않아 한 사람의 마음에 온전히 집중할 수 있습니다."
              : locale === "zh_CN"
              ? "当同伴开始写信时，信件将为您静置15分钟，避免多人重复撞车，让回信者心无旁骛。"
              : "When a peer begins writing, the letter is quietly held for 15 minutes, preventing collision and ensuring full focus."}
          </p>
        </div>

        {/* Pillar 3 */}
        <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-xs transition-all hover:border-accent/40 hover:shadow-tactile">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent mb-4">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h2 className="text-base font-bold tracking-tight text-foreground">
            {locale === "ko_KR"
              ? "100% 무계정 & 제로 PII"
              : locale === "zh_CN"
              ? "零隐私与无账户转移码"
              : "Zero PII & Crockford Code"}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {locale === "ko_KR"
              ? "이메일도 비밀번호도 저장하지 않습니다. 오직 46HZ 이전 코드로만 기기를 옮기며, IP 흔적은 14일 뒤 흔적 없이 소멸합니다."
              : locale === "zh_CN"
              ? "无需手机或邮箱注册，仅凭46HZ转移码在设备间迁移。连接记录遵循GDPR原则14天内彻底清除。"
              : "No emails, passwords, or personal profiles. Transfer devices using Crockford Base32 codes; network traces auto-purge after 14 days."}
          </p>
        </div>
      </section>

      {/* 4-Step Slow Journey ("오늘의 편지함") */}
      <section className="rounded-3xl border border-border/80 bg-surface p-8 sm:p-10 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {t("home.stepsTitle")}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {locale === "ko_KR"
                ? "서두르지 않는 4단계의 따뜻한 여정"
                : locale === "zh_CN"
                ? "不疾不徐的四步慢速旅程"
                : "A four-step human-centered slow journey"}
            </p>
          </div>
          <span className="rounded-full bg-muted/60 px-3 py-1 text-xs font-semibold text-muted-foreground">
            Slow Loop
          </span>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stepKeys.map((item, index) => (
            <div
              key={item.titleKey}
              className="relative rounded-2xl border border-border/70 bg-background/50 p-5 transition-all hover:border-accent/40 hover:bg-background shadow-2xs"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="grid h-7 w-7 place-items-center rounded-xl bg-accent text-xs font-bold text-accent-foreground">
                  {index + 1}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">
                  Step 0{index + 1}
                </span>
              </div>
              <h3 className="text-sm font-bold text-foreground tracking-tight">
                {t(item.titleKey)}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {getStepDesc(item)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Gentle Crisis Care Banner */}
      <section className="rounded-2xl border border-border/70 bg-muted/30 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              {locale === "ko_KR"
                ? "즉각적인 위기 상황에 처해 계신가요?"
                : locale === "zh_CN"
                ? "正在经历紧急的情绪危机吗？"
                : "Experiencing an immediate crisis?"}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {locale === "ko_KR"
                ? "46Hz는 의료·긴급 치료 서비스가 아닙니다. 지금 힘겨운 위기 상황이라면 24시간 전문 위기 상담 리소스를 확인해주세요."
                : locale === "zh_CN"
                ? "46Hz非医疗或紧急救援平台。如遇紧急困难，请随时查阅24小时专业危机援助热线。"
                : "46Hz is not a clinical or emergency service. If you are in crisis, access 24/7 dedicated professional helplines."}
            </p>
          </div>
        </div>

        <Link
          href="/support-resources"
          className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-semibold hover:bg-muted transition-colors"
        >
          <span>
            {locale === "ko_KR"
              ? "전문 지원 자료 보기"
              : locale === "zh_CN"
              ? "查看援助资源"
              : "View Support Resources"}
          </span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </section>
    </div>
  );
}
