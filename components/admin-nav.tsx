import Link from "next/link";
import type { AdminRole } from "@/lib/admin";

const links = [
  { href: "/admin", label: "Metrics", adminOnly: false },
  { href: "/admin/letters", label: "Letters", adminOnly: false },
  { href: "/admin/replies", label: "Replies", adminOnly: false },
  { href: "/admin/reports", label: "Reports", adminOnly: false },
  { href: "/admin/users", label: "Users", adminOnly: true },
  { href: "/admin/resources", label: "Resources", adminOnly: true },
  { href: "/admin/compliance", label: "Compliance (Law Enforcement)", adminOnly: false },
  { href: "/admin/moderation-log", label: "Log", adminOnly: false }
];

export function AdminNav({ role }: { role?: AdminRole | null }) {
  return (
    <nav className="mb-6 flex gap-2 overflow-x-auto pb-1">
      {links.map(({ href, label, adminOnly }) => (
        <Link
          key={href}
          href={href}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          <span>{label}</span>
          {adminOnly && role === "MODERATOR" ? (
            <span className="text-[10px] font-semibold text-muted-foreground opacity-70">
              (Admin)
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
