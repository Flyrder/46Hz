import { suspendUserAction } from "@/app/actions/admin";
import { AdminNav } from "@/components/admin-nav";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { getAdminRole } from "@/lib/admin";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { formatDate } from "@/lib/utils";
import { Users, Shield, UserX, UserCheck, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [role, locale] = await Promise.all([getAdminRole(), getLocalePreference()]);
  if (!role) {
    redirect("/admin");
  }
  const t = createTranslator(locale);

  if (role !== "ADMIN") {
    return (
      <section className="mx-auto max-w-4xl py-2 sm:py-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("admin.usersTitle")}</h1>
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

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 80,
    include: {
      _count: {
        select: {
          letters: true,
          replies: true
        }
      }
    }
  });

  return (
    <section className="mx-auto max-w-5xl py-2 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <Users className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("admin.usersTitle")}</h1>
              <StatusBadge tone="neutral">{t("admin.personUnit", { count: String(users.length) })}</StatusBadge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("admin.usersSubtitle")}
            </p>
          </div>
        </div>
      </div>

      <AdminNav role={role} t={t} />

      <div className="space-y-3">
        {users.map((user) => (
          <article
            key={user.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border/80 bg-surface p-4.5 shadow-soft transition-all hover:border-accent/40"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground">{user.anonymousHandle}</span>
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                  {t("admin.userTrustScorePrefix")} {user.trustScore}
                </span>
                {user.suspendedAt ? (
                  <StatusBadge tone="danger">
                    <span className="flex items-center gap-1">
                      <UserX className="h-3 w-3" /> {t("admin.userSuspendedBadge")}
                    </span>
                  </StatusBadge>
                ) : (
                  <StatusBadge tone="good">
                    <span className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3" /> {t("admin.userActiveBadge")}
                    </span>
                  </StatusBadge>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="h-3 w-3" /> {formatDate(user.createdAt)}
                </span>
                <span>•</span>
                <span>{t("admin.userLettersCount", { count: String(user._count.letters) })}</span>
                <span>•</span>
                <span>{t("admin.userRepliesCount", { count: String(user._count.replies) })}</span>
                <span>•</span>
                <span className="font-mono text-[11px] opacity-70">ID: {user.id.slice(0, 10)}...</span>
              </div>
            </div>

            {!user.suspendedAt ? (
              <form action={suspendUserAction}>
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="reason" value="Suspended from admin user list" />
                <SubmitButton variant="danger">{t("admin.suspendUserButton")}</SubmitButton>
              </form>
            ) : (
              <span className="text-xs text-danger font-medium">{t("admin.userSuspendedStatus")}</span>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
