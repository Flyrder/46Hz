"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminRole } from "@/lib/admin";
import type { TranslationKey } from "@/lib/i18n";
import {
  BarChart3,
  Mail,
  MessageSquare,
  AlertTriangle,
  Users,
  HeartHandshake,
  ShieldCheck,
  History,
  Sliders
} from "lucide-react";

import { useI18n } from "@/lib/i18n";

type AdminNavLink = {
  href: string;
  labelKey: TranslationKey;
  fallbackLabel: string;
  adminOnly: boolean;
  disabled?: boolean;
  icon: typeof BarChart3;
};

const links: AdminNavLink[] = [
  { href: "/admin", labelKey: "admin.navMetrics", fallbackLabel: "Metrics", adminOnly: false, icon: BarChart3 },
  { href: "/admin/letters", labelKey: "admin.navLetters", fallbackLabel: "Letters", adminOnly: false, icon: Mail },
  { href: "/admin/replies", labelKey: "admin.navReplies", fallbackLabel: "Replies", adminOnly: false, icon: MessageSquare },
  { href: "/admin/reports", labelKey: "admin.navReports", fallbackLabel: "Reports", adminOnly: false, icon: AlertTriangle },
  { href: "/admin/users", labelKey: "admin.navUsers", fallbackLabel: "Users", adminOnly: true, icon: Users },
  { href: "/admin/resources", labelKey: "admin.navResources", fallbackLabel: "Resources", adminOnly: true, icon: HeartHandshake },
  { href: "/admin/compliance", labelKey: "admin.navCompliance", fallbackLabel: "Compliance", adminOnly: false, disabled: true, icon: ShieldCheck },
  { href: "/admin/moderation-log", labelKey: "admin.navLog", fallbackLabel: "Log", adminOnly: false, icon: History },
  { href: "/admin/settings", labelKey: "admin.navSettings", fallbackLabel: "Settings", adminOnly: true, icon: Sliders }
];

export function AdminNav({
  role,
  t: customT
}: {
  role?: AdminRole | null;
  t?: (key: string) => string;
}) {
  const pathname = usePathname();
  const { t: contextT } = useI18n();
  const t = customT ?? contextT;

  return (
    <nav aria-label={t("admin.staffNavAria")} className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {links.map(({ href, labelKey, fallbackLabel, adminOnly, disabled, icon: Icon }) => {
        if (disabled) {
          return (
            <span
              key={href}
              aria-disabled="true"
              className="inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl border border-border/50 bg-muted/40 px-3.5 py-2 text-xs font-semibold text-muted-foreground/50 opacity-60 cursor-not-allowed select-none"
              title={t ? t("admin.complianceDisabledBadge") : "Disabled"}
            >
              <Icon className="h-3.5 w-3.5 text-muted-foreground/40" aria-hidden="true" />
              <span className="line-through">{t ? t(labelKey) : fallbackLabel}</span>
              <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold text-muted-foreground/70">
                {t ? t("admin.complianceDisabledBadge") : "Disabled"}
              </span>
            </span>
          );
        }

        const isActive =
          href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
              isActive
                ? "border-accent bg-accent/15 text-accent shadow-soft ring-1 ring-accent/30"
                : "border-border/80 bg-surface text-muted-foreground hover:border-accent/40 hover:bg-muted/70 hover:text-foreground"
            }`}
          >
            <Icon className={`h-3.5 w-3.5 ${isActive ? "text-accent" : "text-muted-foreground"}`} aria-hidden="true" />
            <span>{t ? t(labelKey) : fallbackLabel}</span>
            {adminOnly && role === "MODERATOR" ? (
              <span className="text-[10px] font-bold text-muted-foreground opacity-70">
                {t ? t("admin.adminOnlyBadge") : "(Admin)"}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
