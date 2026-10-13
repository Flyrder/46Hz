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
              <StatusBadge tone="neutral">{resources.length}개</StatusBadge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              대한민국 및 중국 대륙 전용 24시간 위기 상담 리소스 등록 및 활성화 관리입니다.
            </p>
          </div>
        </div>
      </div>

      <AdminNav role={role} t={t} />

      {/* Add New Support Resource Form */}
      <form action={saveSupportResourceAction} className="rounded-2xl border border-border/80 bg-surface p-6 shadow-soft">
        <div className="flex items-center gap-2 border-b border-border/50 pb-3">
          <PlusCircle className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-bold text-foreground">새 위기 지원 자료 등록</h2>
        </div>

        <div className="mt-4 grid gap-3.5 sm:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-foreground">기관 / 핫라인 명칭</label>
            <input
              name="title"
              placeholder="예: 24시 자살예방 상담전화 (109)"
              className="mt-1.5 w-full min-h-[44px] rounded-xl border border-border bg-background px-3.5 py-2 text-xs outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground">서비스 지역 (KR 또는 CN)</label>
            <select
              name="region"
              defaultValue="KR"
              className="mt-1.5 w-full min-h-[44px] rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              required
            >
              <option value="KR">대한민국 (KR)</option>
              <option value="CN">중국 대륙 (CN)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground">제공 언어 (ko, zh, en)</label>
            <select
              name="language"
              defaultValue="ko"
              className="mt-1.5 w-full min-h-[44px] rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
              required
            >
              <option value="ko">한국어 (ko)</option>
              <option value="zh">中文 (zh)</option>
              <option value="en">English (en)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-foreground">전화번호 / 핫라인</label>
            <input
              name="phone"
              placeholder="예: 109 또는 400-161-9995"
              className="mt-1.5 w-full min-h-[44px] rounded-xl border border-border bg-background px-3.5 py-2 text-xs outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
          </div>
        </div>

        <div className="mt-3.5">
          <label className="text-xs font-semibold text-foreground">공식 웹사이트 URL</label>
          <input
            name="url"
            type="url"
            placeholder="https://..."
            className="mt-1.5 w-full min-h-[44px] rounded-xl border border-border bg-background px-3.5 py-2 text-xs outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div className="mt-3.5">
          <label className="text-xs font-semibold text-foreground">상세 설명</label>
          <textarea
            name="description"
            rows={3}
            placeholder="제공 서비스 내용 및 긴급 상담 안내 설명"
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
            공개 활성화 (Active)
          </label>
        </div>

        <div className="mt-5">
          <SubmitButton>지원 자료 등록</SubmitButton>
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
                  {resource.active ? "활성 (ACTIVE)" : "비활성 (INACTIVE)"}
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
                <label className="text-[11px] font-semibold text-muted-foreground">명칭</label>
                <input
                  name="title"
                  defaultValue={resource.title}
                  className="mt-1 w-full min-h-[40px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">지역 (KR / CN)</label>
                <input
                  name="region"
                  defaultValue={resource.region}
                  className="mt-1 w-full min-h-[40px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">언어 (ko / zh / en)</label>
                <input
                  name="language"
                  defaultValue={resource.language}
                  className="mt-1 w-full min-h-[40px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground">전화번호</label>
                <input
                  name="phone"
                  defaultValue={resource.phone ?? ""}
                  className="mt-1 w-full min-h-[40px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-[11px] font-semibold text-muted-foreground">웹사이트 URL</label>
              <input
                name="url"
                defaultValue={resource.url ?? ""}
                className="mt-1 w-full min-h-[40px] rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
              />
            </div>

            <div className="mt-3">
              <label className="text-[11px] font-semibold text-muted-foreground">상세 설명</label>
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
                <span>활성 상태 유지</span>
              </label>

              <SubmitButton variant="secondary">수정 내용 저장</SubmitButton>
            </div>
          </form>
        ))}
      </div>
    </section>
  );
}
