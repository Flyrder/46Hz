import { adminLoginAction, adminLogoutAction } from "@/app/actions/admin";
import { AdminNav } from "@/components/admin-nav";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { getAdminRole } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { Activity, Sparkles } from "lucide-react";

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
      <section className="mx-auto max-w-md">
        <h1 className="text-3xl font-semibold">{t("admin.staffAccessTitle")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("admin.staffAccessSubtitle")}
        </p>
        <form action={adminLoginAction} className="mt-6 rounded-lg border border-border bg-surface p-5 shadow-soft">
          <label className="text-sm font-semibold" htmlFor="passcode">
            {t("admin.passcodeLabel")}
          </label>
          <input
            id="passcode"
            name="passcode"
            type="password"
            required
            placeholder={t("admin.passcodePlaceholder")}
            className="mt-2 w-full rounded-lg border border-border px-3 py-3 outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          {errorParam === "rate_limited" ? (
            <p className="mt-3 text-sm text-danger" role="alert">
              {t("admin.rateLimited")}
            </p>
          ) : errorParam ? (
            <p className="mt-3 text-sm text-danger" role="alert">
              {t("admin.invalidPasscode")}
            </p>
          ) : null}
          <div className="mt-4">
            <SubmitButton>{t("admin.enterDashboard")}</SubmitButton>
          </div>
        </form>
      </section>
    );
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    lettersToday,
    repliesToday,
    pendingLetters,
    pendingReplies,
    highRisk,
    reports,
    feedbackCount,
    understoodCount,
    replyCount,
    rejectedReplyCount,
    recentLetters
  ] = await prisma.$transaction([
    prisma.letter.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.reply.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.letter.count({ where: { status: "PENDING" } }),
    prisma.reply.count({ where: { status: "PENDING" } }),
    prisma.letter.count({ where: { riskLevel: "HIGH" } }),
    prisma.feedback.count({ where: { reportReason: { not: null } } }),
    prisma.feedback.count(),
    prisma.feedback.count({ where: { feltUnderstood: true } }),
    prisma.reply.count(),
    prisma.reply.count({ where: { status: "REJECTED" } }),
    prisma.letter.findMany({
      select: { emotionTags: true, riskLevel: true },
      take: 100,
      orderBy: { createdAt: "desc" }
    })
  ]);

  const emotionCounts: Record<string, number> = {
    lonely: 0,
    anxious: 0,
    overwhelmed: 0,
    sad: 0
  };

  for (const letter of recentLetters) {
    for (const tag of letter.emotionTags) {
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

  const metrics = [
    ["Letters today", lettersToday],
    ["Replies today", repliesToday],
    ["Pending moderation", pendingLetters + pendingReplies],
    ["High-risk letters", highRisk],
    ["Reports", reports],
    ["Understood rate", feedbackCount ? `${Math.round((understoodCount / feedbackCount) * 100)}%` : "n/a"],
    ["Rejected reply rate", replyCount ? `${Math.round((rejectedReplyCount / replyCount) * 100)}%` : "n/a"]
  ];

  return (
    <section>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold">{t("admin.dashboardTitle")}</h1>
            <StatusBadge tone={role === "ADMIN" ? "good" : "neutral"}>
              {role === "ADMIN" ? "Administrator" : "Moderator"}
            </StatusBadge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("admin.dashboardSubtitle")}
          </p>
        </div>
        <form action={adminLogoutAction}>
          <SubmitButton variant="secondary">{t("admin.logout")}</SubmitButton>
        </form>
      </div>

      <AdminNav role={role} t={t} />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border bg-surface p-4 shadow-soft">
            <div className="text-xs font-semibold text-muted-foreground">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
          </div>
        ))}
      </div>

      {/* Admin AI Emotional Radar Widget */}
      <div className="mt-6 rounded-2xl border border-border/80 bg-surface p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" aria-hidden="true" />
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
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

        <p className="mt-2 text-xs text-muted-foreground">
          {t("admin.emotionRadarDesc")}
        </p>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {emotionStats.map((item) => (
            <div key={item.key} className="rounded-xl border border-border/70 bg-background/60 p-3.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-foreground">{item.label}</span>
                <span className="font-mono text-muted-foreground">{item.count}건 ({item.percent}%)</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-500`}
                  style={{ width: `${Math.min(100, item.percent)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <StatusBadge tone="warning">{pendingLetters} pending letters</StatusBadge>
        <StatusBadge tone="warning">{pendingReplies} pending replies</StatusBadge>
      </div>
    </section>
  );
}
