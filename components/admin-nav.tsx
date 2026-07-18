import Link from "next/link";

const links = [
  ["/admin", "Metrics"],
  ["/admin/letters", "Letters"],
  ["/admin/replies", "Replies"],
  ["/admin/reports", "Reports"],
  ["/admin/users", "Users"],
  ["/admin/resources", "Resources"],
  ["/admin/moderation-log", "Log"]
];

export function AdminNav() {
  return (
    <nav className="mb-6 flex gap-2 overflow-x-auto pb-1">
      {links.map(([href, label]) => (
        <Link
          key={href}
          href={href}
          className="whitespace-nowrap rounded-lg border border-border bg-surface px-3 py-2 text-sm font-medium hover:bg-muted"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
