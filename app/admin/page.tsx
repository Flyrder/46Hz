import Link from "next/link";
import { adminLoginAction, adminLogoutAction } from "@/app/actions/admin";
import { AdminNav } from "@/components/admin-nav";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { getAdminRole } from "@/lib/admin";
import { toTimestamp } from "@/lib/dates";
import { db } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import {
  Activity,
  Sparkles,
  Mail,
  MessageSquare,
  Clock,
  ShieldAlert,
  AlertTriangle,
  HeartHandshake,
  ShieldX,
  ArrowUpRight
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const [role, locale] = await Promise.all([getAdminRole(), getLocalePreference()]);
  const t = createTranslator(locale);
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const errorParam = resolvedSearchParams?.error;

  if (!role) {
    return (
      <section className="mx-auto max-w-md py-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("admin.staffAccessTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {t("admin.staffAccessSubtitle")}
        </p>
        <form action={adminLoginAction} className="mt-6 rounded-2xl border border-border/80 bg-surface p-6 shadow-soft">
          <label className="text-sm font-semibold text-foreground" htmlFor="passcode">
            {t("admin.passcodeLabel")}
          </label>
          <input
            id="passcode"
            name="passcode"
            type="password"
            required
            placeholder={t("admin.passcodePlaceholder")}
            className="mt-2 w-full min-h-[44px] rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          {errorParam === "rate_limited" ? (
            <p className="mt-3 text-xs font-medium text-danger" role="alert">
              {t("admin.rateLimited")}
            </p>
          ) : errorParam ? (
            <p className="mt-3 text-xs font-medium text-danger" role="alert">
              {t("admin.invalidPasscode")}
            </p>
          ) : null}
          <div className="mt-5">
            <SubmitButton>{t("admin.enterDashboard")}</SubmitButton>
          </div>
        </form>
      </section>
    );
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTodayTimestamp = toTimestamp(startOfToday);

  const letterMetricsPlan = db.raw.sql`
    SELECT
      COUNT(*) FILTER (WHERE "createdAt" >= ${startOfTodayTimestamp})::int AS "lettersToday",
      COUNT(*) FILTER (WHERE "status" = 'PENDING')::int AS "pendingLetters",
      COUNT(*) FILTER (WHERE "riskLevel" = 'HIGH')::int AS "highRisk"
    FROM "public"."Letter"
  `.returnsRow({
    lettersToday: "pg/int4@1",
    pendingLetters: "pg/int4@1",
    highRisk: "pg/int4@1"
  }).build();

  const feedbackMetricsPlan = db.raw.sql`
    SELECT
      COUNT(*)::int AS "feedbackCount",
      COUNT(*) FILTER (WHERE "reportReason" IS NOT NULL)::int AS "reports",
      COUNT(*) FILTER (WHERE "feltUnderstood" = true)::int AS "understoodCount"
    FROM "public"."Feedback"
  `.returnsRow({
    feedbackCount: "pg/int4@1",
    reports: "pg/int4@1",
    understoodCount: "pg/int4@1"
  }).build();

  const replyMetricsPlan = db.raw.sql`
    SELECT
      COUNT(*)::int AS "replyCount",
      COUNT(*) FILTER (WHERE "createdAt" >= ${startOfTodayTimestamp})::int AS "repliesToday",
      COUNT(*) FILTER (WHERE "status" = 'PENDING')::int AS "pendingReplies",
      COUNT(*) FILTER (WHERE "status" = 'REJECTED')::int AS "rejectedReplyCount"
    FROM "public"."Reply"
  `.returnsRow({
    replyCount: "pg/int4@1",
    repliesToday: "pg/int4@1",
    pendingReplies: "pg/int4@1",
    rejectedReplyCount: "pg/int4@1"
  }).build();

  const [
    [letterStats],
    [feedbackStats],
    [replyStats],
    recentLetters
  ] = await Promise.all([
    db.runtime().query(letterMetricsPlan),
    db.runtime().query(feedbackMetricsPlan),
    db.runtime().query(replyMetricsPlan),
    db.orm.public.Letter
      .select("emotionTags", "riskLevel")
      .orderBy((letter) => letter.createdAt.desc())
      .limit(100)
      .all()
  ]);

  const lettersToday = letterStats?.lettersToday ?? 0;
  const repliesToday = replyStats?.repliesToday ?? 0;
  const pendingLetters = letterStats?.pendingLetters ?? 0;
  const highRisk = letterStats?.highRisk ?? 0;
  const reports = feedbackStats?.reports ?? 0;
  const feedbackCount = feedbackStats?.feedbackCount ?? 0;
  const understoodCount = feedbackStats?.understoodCount ?? 0;
  const pendingReplies = replyStats?.pendingReplies ?? 0;
  const rejectedReplyCount = replyStats?.rejectedReplyCount ?? 0;
  const replyCount = replyStats?.replyCount ?? 0;

  const emotionCounts: Record<string, number> = {
    lonely: 0,
    anxious: 0,
    overwhelmed: 0,
    sad: 0
  };

  for (const letter of recentLetters) {
    for (const tag of letter.emotionTags ?? []) {
      const lower = tag.toLowerCase();
      if (lower in emotionCounts) {
        emotionCounts[lower]++;
      }
    }
  }

  const sampleSize = Math.max(recentLetters.length, 1);
  const emotionStats = [
    { key: "lonely", label: t("admin.emotionRadarLonely"), count: emotionCounts.lonely, color: "bg-blue-500", percent: Math.round((emotionCounts.lonely / sampleSize) * 100) },
    { key: "anxious", label: t("admin.emotionRadarAnxious"), count: emotionCounts.anxious, color: "bg-amber-500", percent: Math.round((emotionCounts.anxious / sampleSize) * 100) },
    { key: "overwhelmed", label: t("admin.emotionRadarOverwhelmed"), count: emotionCounts.overwhelmed, color: "bg-rose-500", percent: Math.round((emotionCounts.overwhelmed / sampleSize) * 100) },
    { key: "sad", label: t("admin.emotionRadarSad"), count: emotionCounts.sad, color: "bg-indigo-500", percent: Math.round((emotionCounts.sad / sampleSize) * 100) }
  ];

  const metrics: Array<{
    label: string;
    value: string | number;
    icon: typeof Mail;
    tone: "neutral" | "good" | "warning" | "danger";
    href: string;
    detail: string;
  }> = [
    {
      label: t("admin.metricsLettersToday"),
      value: lettersToday,
      icon: Mail,
      tone: "neutral",
      href: "/admin/letters?filter=today",
      detail: t("admin.metricsLettersTodayDetail")
    },
    {
      label: t("admin.metricsRepliesToday"),
      value: repliesToday,
      icon: MessageSquare,
      tone: "neutral",
      href: "/admin/replies?filter=today",
      detail: t("admin.metricsRepliesTodayDetail")
    },
    {
      label: t("admin.metricsPendingModeration"),
      value: pendingLetters + pendingReplies,
      icon: Clock,
      tone: pendingLetters + pendingReplies > 0 ? "warning" : "good",
      href: "/admin/letters?status=PENDING",
      detail: t("admin.metricsPendingDetail", { letters: String(pendingLetters), replies: String(pendingReplies) })
    },
    {
      label: t("admin.metricsHighRisk"),
      value: highRisk,
      icon: ShieldAlert,
      tone: highRisk > 0 ? "danger" : "good",
      href: "/admin/letters?risk=HIGH",
      detail: t("admin.metricsHighRiskDetail")
    },
    {
      label: t("admin.metricsReports"),
      value: reports,
      icon: AlertTriangle,
      tone: reports > 0 ? "warning" : "good",
      href: "/admin/reports",
      detail: t("admin.metricsReportsDetail")
    },
    {
      label: t("admin.metricsUnderstoodRate"),
      value: feedbackCount ? `${Math.round((understoodCount / feedbackCount) * 100)}%` : "N/A",
      icon: HeartHandshake,
      tone: "good",
      href: "/admin/reports",
      detail: t("admin.metricsUnderstoodDetail", { positive: String(understoodCount), total: String(feedbackCount) })
    },
    {
      label: t("admin.metricsRejectedRate"),
      value: replyCount ? `${Math.round((rejectedReplyCount / replyCount) * 100)}%` : "N/A",
      icon: ShieldX,
      tone: "neutral",
      href: "/admin/replies?status=REJECTED",
      detail: t("admin.metricsRejectedDetail", { rejected: String(rejectedReplyCount), total: String(replyCount) })
    }
  ];

  return (
    <section className="mx-auto max-w-5xl py-2 sm:py-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("admin.dashboardTitle")}</h1>
            <StatusBadge tone={role === "ADMIN" ? "good" : "neutral"}>
              {role === "ADMIN" ? t("admin.roleAdmin") : t("admin.roleModerator")}
            </StatusBadge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {t("admin.dashboardSubtitle")}
          </p>
        </div>
        <form action={adminLogoutAction}>
          <SubmitButton variant="secondary">{t("admin.logout")}</SubmitButton>
        </form>
      </div>

      <AdminNav role={role} />

      {/* Metrics Cards Grid - Clickable with correlated details */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, tone, href, detail }) => (
          <Link
            key={label}
            href={href}
            className="group flex flex-col justify-between rounded-2xl border border-border/80 bg-surface p-4.5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-tactile active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <div>
              <div className="flex items-center justify-between gap-2 text-xs font-semibold text-muted-foreground group-hover:text-accent transition-colors">
                <span>{label}</span>
                <span className="flex items-center gap-1">
                  <Icon className="h-4 w-4 opacity-75 group-hover:opacity-100" aria-hidden="true" />
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
                </span>
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-2">
                <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
                <StatusBadge tone={tone}>{String(value)}</StatusBadge>
              </div>
            </div>
            <p className="mt-3 border-t border-border/50 pt-2.5 text-[11px] font-medium text-muted-foreground group-hover:text-accent transition-colors">
              {detail}
            </p>
          </Link>
        ))}
      </div>

      {/* Admin AI Emotional Climate Radar Widget */}
      <div className="mt-6 rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4.5 w-4.5 text-accent" aria-hidden="true" />
            <h2 className="text-sm font-bold tracking-tight text-foreground">
              {t("admin.emotionRadarTitle")}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>
              {t("admin.emotionRadarTotalAnalyzed")}: <strong className="text-foreground">{recentLetters.length}</strong>
            </span>
          </div>
        </div>

        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {t("admin.emotionRadarDesc")}
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {emotionStats.map((item) => (
            <Link
              key={item.key}
              href={`/admin/letters?tag=${item.key}`}
              className="group rounded-xl border border-border/70 bg-background/60 p-3.5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-surface hover:shadow-tactile active:scale-[0.99]"
              title={t("admin.viewTagLettersTitle", { tag: item.label })}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground group-hover:text-accent transition-colors flex items-center gap-1">
                  {item.label}
                  <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <span className="font-mono text-muted-foreground">
                  {t("admin.radarCountFormat", { count: String(item.count), percent: String(item.percent) })}
                </span>
              </div>
              <div className="mt-2.5 h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: `${Math.min(100, item.percent)}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Pending Queues Status Badges */}
      <div className="mt-6 flex flex-wrap gap-2.5">
        <Link href="/admin/letters?status=PENDING" className="inline-block transition-transform hover:scale-105 active:scale-95">
          <StatusBadge tone={pendingLetters > 0 ? "warning" : "good"}>
            {t("admin.pendingLettersBadge", { count: String(pendingLetters) })} →
          </StatusBadge>
        </Link>
        <Link href="/admin/replies?status=PENDING" className="inline-block transition-transform hover:scale-105 active:scale-95">
          <StatusBadge tone={pendingReplies > 0 ? "warning" : "good"}>
            {t("admin.pendingRepliesBadge", { count: String(pendingReplies) })} →
          </StatusBadge>
        </Link>
      </div>
    </section>
  );
}
