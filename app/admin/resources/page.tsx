import { saveSupportResourceAction } from "@/app/actions/admin";
import { AdminNav } from "@/components/admin-nav";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { getAdminRole } from "@/lib/admin";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { HeartHandshake, PlusCircle, Shield, Phone, Globe } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const [role, locale] = await Promise.all([getAdminRole(), getLocalePreference()]);
  if (!role) {
    redirect("/admin");
  }
  const t = createTranslator(locale);

  if (role !== "ADMIN") {
    return (
      <section className="mx-auto max-w-4xl py-2 sm:py-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("admin.resourcesTitle")}</h1>
        <AdminNav role={role} t={t} />
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 text-center shadow-soft">
          <Shield className="mx-auto h-8 w-8 text-amber-600 dark:text-amber-400 mb-2" />
          <h2 className="text-lg font-bold text-foreground">{t("admin.adminRequiredTitle")}</h2>
          <p className="mt-2 text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            {t("admin.adminRequiredDesc")}
          </p>
        </div>
      </section>
    );
  }

  const resources = await prisma.supportResource.findMany({
    orderBy: [{ active: "desc" }, { region: "asc" }, { title: "asc" }]
  });

  return (
    <section className="mx-auto max-w-5xl py-2 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <HeartHandshake className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("admin.resourcesTitle")}</h1>
              <StatusBadge tone="neutral">{t("admin.itemUnit", { count: String(resources.length) })}</StatusBadge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("admin.resourcesSubtitle")}
            </p>
          </div>
        </div>
      </div>

      <AdminNav role={role} t={t} />

      {/* Add New Support Resource Form */}
      <form action={saveSupportResourceAction} className="rounded-2xl border border-border/80 bg-surface p-6 shadow-soft">
        <div className="flex items-center gap-2 border-b border-border/50 pb-3">
          <PlusCircle className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-bold text-foreground">{t("admin.addResourceTitle")}</h2>
        </div>

        <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-foreground">{t("admin.resourceTitleLabel")}</label>
            <input
              name="title"
              placeholder={t("admin.resourceTitlePlaceholder")}
              className="mt-1.5 w-full min-h-[44px] rounded-xl border border-border bg-background px-3.5 py-2 text-xs outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground">{t("admin.resourceRegionLabel")}</label>
            <select
              name="region"
              defaultValue="KR"
              className="mt-1.5 w-full min-h-[44px] rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              required
            >
              <option value="KR">{t("admin.resourceRegionKR")}</option>
              <option value="CN">{t("admin.resourceRegionCN")}</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground">{t("admin.resourceLangLabel")}</label>
            <select
              name="language"
              defaultValue="ko"
              className="mt-1.5 w-full min-h-[44px] rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              required
            >
              <option value="ko">{t("admin.resourceLangKo")}</option>
              <option value="zh">{t("admin.resourceLangZh")}</option>
              <option value="en">{t("admin.resourceLangEn")}</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground">{t("admin.resourcePhoneLabel")}</label>
            <input
              name="phone"
              placeholder={t("admin.resourcePhonePlaceholder")}
              className="mt-1.5 w-full min-h-[44px] rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        <div className="mt-3.5">
          <label className="text-xs font-semibold text-foreground">{t("admin.resourceUrlLabel")}</label>
          <input
            name="url"
            type="url"
            placeholder="https://..."
            className="mt-1.5 w-full min-h-[44px] rounded-xl border border-border bg-background px-3.5 py-2 text-xs outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div className="mt-3.5">
          <label className="text-xs font-semibold text-foreground">{t("admin.resourceDescLabel")}</label>
          <textarea
            name="description"
            rows={3}
            placeholder={t("admin.resourceDescPlaceholder")}
            className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-xs outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            required
          />
        </div>

        <div className="mt-3.5 flex items-center gap-2 text-xs">
          <input
            id="new-active"
            name="active"
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
          />
          <label htmlFor="new-active" className="font-semibold text-foreground">
            {t("admin.resourceActiveLabel")}
          </label>
        </div>

        <div className="mt-5">
          <SubmitButton>{t("admin.addResourceButton")}</SubmitButton>
        </div>
      </form>

      {/* Existing Resources List */}
      <div className="mt-6 space-y-4">
        {resources.map((resource) => (
          <form
            key={resource.id}
            action={saveSupportResourceAction}
            className="rounded-2xl border border-border/80 bg-surface p-5 shadow-soft transition-all hover:border-accent/40"
          >
            <input type="hidden" name="id" value={resource.id} />
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <StatusBadge tone={resource.active ? "good" : "neutral"}>
                  {resource.active ? t("admin.resourceActiveBadge") : t("admin.resourceInactiveBadge")}
                </StatusBadge>
                <span className="font-bold text-foreground text-sm">{resource.title}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusBadge tone="neutral">{resource.region}</StatusBadge>
                <StatusBadge tone="neutral">{resource.language.toUpperCase()}</StatusBadge>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">{t("admin.resourceNameLabel")}</label>
                <input
                  name="title"
                  defaultValue={resource.title}
                  className="mt-1 w-full min-h-[40px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">{t("admin.resourceRegionShortLabel")}</label>
                <input
                  name="region"
                  defaultValue={resource.region}
                  className="mt-1 w-full min-h-[40px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">{t("admin.resourceLangShortLabel")}</label>
                <input
                  name="language"
                  defaultValue={resource.language}
                  className="mt-1 w-full min-h-[40px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">{t("admin.resourcePhoneShortLabel")}</label>
                <input
                  name="phone"
                  defaultValue={resource.phone ?? ""}
                  className="mt-1 w-full min-h-[40px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-[11px] font-semibold text-muted-foreground">{t("admin.resourceUrlLabel")}</label>
              <input
                name="url"
                defaultValue={resource.url ?? ""}
                className="mt-1 w-full min-h-[40px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div className="mt-3">
              <label className="text-[11px] font-semibold text-muted-foreground">{t("admin.resourceDescLabel")}</label>
              <textarea
                name="description"
                defaultValue={resource.description}
                rows={2}
                className="mt-1 w-full rounded-xl border border-border bg-background p-3 text-xs leading-relaxed outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div className="mt-3 flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  name="active"
                  type="checkbox"
                  defaultChecked={resource.active}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                />
                <span>{t("admin.keepActiveLabel")}</span>
              </label>

              <SubmitButton variant="secondary">{t("admin.saveResourceChangesButton")}</SubmitButton>
            </div>
          </form>
        ))}
      </div>
    </section>
  );
}
