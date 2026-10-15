"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PenLine, HeartHandshake, Inbox, Settings } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const navItems = [
    { href: "/", label: "Home", icon: Home, exact: true },
    { href: "/write", label: t("nav.write"), icon: PenLine, exact: false },
    { href: "/reply", label: t("nav.reply"), icon: HeartHandshake, exact: false },
    { href: "/inbox", label: t("nav.inbox"), icon: Inbox, exact: false },
    { href: "/settings", label: t("nav.settings"), icon: Settings, exact: false }
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 border-t border-border/80 bg-surface/92 backdrop-blur-lg sm:hidden pb-safe shadow-tactile transition-colors"
    >
      <div className="flex h-16 items-center justify-around px-2 max-w-lg mx-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              className={`relative flex min-h-[48px] min-w-[56px] flex-col items-center justify-center gap-1 rounded-xl transition-all duration-150 active:scale-90 ${
                isActive
                  ? "text-accent font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : ""}`} aria-hidden="true" />
              <span className="text-[10px] tracking-tight leading-none">{label}</span>
              {isActive && (
                <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-accent" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
