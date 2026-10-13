import Link from "next/link";
import type { AdminRole } from "@/lib/admin";
import type { TranslationKey } from "@/lib/i18n";

const links: Array<{ href: string; labelKey: TranslationKey; fallbackLabel: string; adminOnly: boolean }> = [
  { href: "/admin", labelKey: "admin.navMetrics", fallbackLabel: "Metrics", adminOnly: false },
  { href: "/admin/letters", labelKey: "admin.navLetters", fallbackLabel: "Letters", adminOnly: false },
  { href: "/admin/replies", labelKey: "admin.navReplies", fallbackLabel: "Replies", adminOnly: false },
  { href: "/admin/reports", labelKey: "admin.navReports", fallbackLabel: "Reports", adminOnly: false },
  { href: "/admin/users", labelKey: "admin.navUsers", fallbackLabel: "Users", adminOnly: true },
  { href: "/admin/resources", labelKey: "admin.navResources", fallbackLabel: "Resources", adminOnly: true },
  { href: "/admin/compliance", labelKey: "admin.navCompliance", fallbackLabel: "Compliance (Law Enforcement)", adminOnly: false },
  { href: "/admin/moderation-log", labelKey: "admin.navLog", fallbackLabel: "Log", adminOnly: false }
];

export function AdminNav({
  role,
  t
}: {
  role?: AdminRole | null;
  t?: (key: string) => string;
}) {
  return (
    <nav aria-label="Staff navigation" className="mb-6 flex gap-2 overflow-x-auto pb-1">
      {links.map(({ href, labelKey, fallbackLabel, adminOnly }) => (
        <Link
          key={href}
          href={href}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          <span>{t ? t(labelKey) : fallbackLabel}</span>
          {adminOnly && role === "MODERATOR" ? (
            <span className="text-[10px] font-semibold text-muted-foreground opacity-70">
              {t ? t("admin.adminOnlyBadge") : "(Admin)"}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
