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
  History
} from "lucide-react";

type AdminNavLink = {
  href: string;
  labelKey: TranslationKey;
  fallbackLabel: string;
  adminOnly: boolean;
  icon: typeof BarChart3;
};

const links: AdminNavLink[] = [
  { href: "/admin", labelKey: "admin.navMetrics", fallbackLabel: "Metrics", adminOnly: false, icon: BarChart3 },
  { href: "/admin/letters", labelKey: "admin.navLetters", fallbackLabel: "Letters", adminOnly: false, icon: Mail },
  { href: "/admin/replies", labelKey: "admin.navReplies", fallbackLabel: "Replies", adminOnly: false, icon: MessageSquare },
  { href: "/admin/reports", labelKey: "admin.navReports", fallbackLabel: "Reports", adminOnly: false, icon: AlertTriangle },
  { href: "/admin/users", labelKey: "admin.navUsers", fallbackLabel: "Users", adminOnly: true, icon: Users },
  { href: "/admin/resources", labelKey: "admin.navResources", fallbackLabel: "Resources", adminOnly: true, icon: HeartHandshake },
  { href: "/admin/compliance", labelKey: "admin.navCompliance", fallbackLabel: "Compliance", adminOnly: false, icon: ShieldCheck },
  { href: "/admin/moderation-log", labelKey: "admin.navLog", fallbackLabel: "Log", adminOnly: false, icon: History }
];

export function AdminNav({
  role,
  t
}: {
  role?: AdminRole | null;
  t?: (key: string) => string;
}) {
  const pathname = usePathname();

  return (
    <nav aria-label="Staff navigation" className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {links.map(({ href, labelKey, fallbackLabel, adminOnly, icon: Icon }) => {
        const isActive =
          href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`inline-flex min-h-[40px] items-center gap-2 whitespace-nowrap rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
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
