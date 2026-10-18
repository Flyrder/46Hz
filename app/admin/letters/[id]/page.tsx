import { notFound } from "next/navigation";
import { moderateLetterAction, overrideLetterRiskAction } from "@/app/actions/admin";
import { AdminNav } from "@/components/admin-nav";
import { ModerationSelect, type ModerationOption } from "@/components/moderation-select";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireStaff } from "@/lib/admin";
import { db } from "@/lib/db";
import { createTranslator, formatTag } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { formatDate } from "@/lib/utils";
import { FileText, ShieldAlert, Sparkles, User, Tag, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLetterDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const [role, locale] = await Promise.all([requireStaff(), getLocalePreference()]);
  const t = createTranslator(locale);
  const { id } = await params;
  const letter = await db.orm.public.Letter
    .include("author", (author) => author.select("anonymousHandle", "trustScore"))
    .first({ id });

  if (!letter) {
    notFound();
  }

  const statusOptions: ModerationOption[] = [
    { value: "PENDING", label: t("admin.statusPending"), tone: "warning" },
    { value: "APPROVED", label: t("admin.statusApproved"), tone: "good" },
    { value: "REJECTED", label: t("admin.statusRejected"), tone: "danger" },
    { value: "ROUTED_TO_SUPPORT", label: t("admin.statusRoutedSupport"), tone: "neutral" }
  ];

  const riskOptions: ModerationOption[] = [
    { value: "NORMAL", label: t("admin.riskNormal"), tone: "good" },
    { value: "SENSITIVE", label: t("admin.riskSensitive"), tone: "warning" },
    { value: "HIGH", label: t("admin.riskHigh"), tone: "danger" },
    { value: "BLOCKED", label: t("admin.riskBlocked"), tone: "danger" }
  ];

  return (
    <section className="mx-auto max-w-5xl py-2 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("admin.letterReviewTitle")}</h1>
          <p className="mt-1 text-xs text-muted-foreground font-mono">ID: {letter.id}</p>
        </div>
      </div>

      <AdminNav role={role} />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Letter Inspection Card */}
        <article className="rounded-2xl border border-border/80 bg-surface p-6 shadow-soft">
          <div className="flex flex-wrap items-center gap-2 border-b border-border/50 pb-4">
            <StatusBadge>{t(`status.${letter.status}`)}</StatusBadge>
            <StatusBadge tone={letter.riskLevel === "NORMAL" ? "good" : "warning"}>
              {t(`status.${letter.riskLevel}`)}
            </StatusBadge>
            <StatusBadge tone="neutral">{t(`replyType.${letter.desiredReplyType}`)}</StatusBadge>
          </div>

          <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs">
            <div>
              <dt className="font-semibold text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-accent" />
                {t("admin.authorLabel")}
              </dt>
              <dd className="mt-1 font-medium text-foreground">
                {letter.author?.anonymousHandle ?? "Anonymous"} {t("admin.trustScoreSuffix", { score: String(letter.author?.trustScore ?? 50) })}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-accent" />
                {t("admin.createdDateLabel")}
              </dt>
              <dd className="mt-1 font-medium text-foreground">{formatDate(letter.createdAt)}</dd>
            </div>
            <div className="col-span-2 pt-2 border-t border-border/40">
              <dt className="font-semibold text-muted-foreground flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-accent" />
                {t("admin.tagsLabel")}
              </dt>
              <dd className="mt-1 font-medium text-foreground">
                {[...(letter.emotionTags ?? []), ...(letter.situationTags ?? [])]
                  .map((tag) => formatTag(tag, t))
                  .join(", ") || t("admin.noTags")}
              </dd>
            </div>
          </dl>

          <div className="mt-6">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-accent" />
              {t("admin.processedTextSection")}
            </h2>
            <div className="mt-2.5 font-letter rounded-xl border border-border/80 bg-background/50 p-4 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
              {letter.processedText}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-muted-foreground" />
              {t("admin.rawTextSection")}
            </h2>
            <div className="mt-2.5 font-letter rounded-xl border border-border/60 bg-muted/40 p-4 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {letter.rawText}
            </div>
          </div>
        </article>

        {/* Moderation Controls Workbench */}
        <div className="space-y-5">
          <form action={moderateLetterAction} className="rounded-2xl border border-border/80 bg-surface p-6 shadow-soft">
            <h2 className="text-base font-bold text-foreground">{t("admin.moderationDecisionTitle")}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("admin.moderationDecisionDesc")}
            </p>

            <input type="hidden" name="letterId" value={letter.id} />

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5" htmlFor="status">
                  {t("admin.statusSelectLabel")}
                </label>
                <ModerationSelect
                  id="status"
                  name="status"
                  defaultValue={letter.status}
                  options={statusOptions}
                  ariaLabel={t("admin.statusSelectLabel")}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5" htmlFor="riskLevel">
                  {t("admin.riskLevelSelectLabel")}
                </label>
                <ModerationSelect
                  id="riskLevel"
                  name="riskLevel"
                  defaultValue={letter.riskLevel}
                  options={riskOptions}
                  ariaLabel={t("admin.riskLevelSelectLabel")}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground" htmlFor="reason">
                  {t("admin.reasonLabel")}
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows={3}
                  placeholder={t("admin.reasonPlaceholder")}
                  className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-xs outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <div className="mt-5">
              <SubmitButton>{t("admin.saveModeration")}</SubmitButton>
            </div>
          </form>

          {/* Quick Risk Override Form */}
          <form action={overrideLetterRiskAction} className="rounded-2xl border border-border/80 bg-surface p-6 shadow-soft">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-warning" />
              <h3 className="text-sm font-bold text-foreground">{t("admin.quickRiskOverrideTitle")}</h3>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("admin.quickRiskOverrideDesc")}
            </p>

            <input type="hidden" name="letterId" value={letter.id} />

            <div className="mt-3">
              <ModerationSelect
                id="risk-override"
                name="riskLevel"
                defaultValue={letter.riskLevel}
                options={riskOptions}
                ariaLabel={t("admin.quickRiskOverrideAria")}
              />
            </div>
            <input type="hidden" name="reason" value="Admin risk override from detail page" />
            <div className="mt-4">
              <SubmitButton variant="secondary">{t("admin.riskOverrideButton")}</SubmitButton>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
