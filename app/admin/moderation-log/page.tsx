import { AdminNav } from "@/components/admin-nav";
import { StatusBadge } from "@/components/status-badge";
import { requireStaff } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ModerationLogPage() {
  const role = await requireStaff();
  const events = await prisma.moderationEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <section className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-semibold">Moderation log</h1>
      <AdminNav role={role} />
      <div className="space-y-3">
        {events.map((event) => (
          <article key={event.id} className="rounded-lg border border-border bg-surface p-4 shadow-soft">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge>{event.targetType.toLowerCase()}</StatusBadge>
              <StatusBadge>{event.action}</StatusBadge>
              <span className="text-xs text-muted-foreground">{formatDate(event.createdAt)}</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {event.previousStatus ?? "none"} -&gt; {event.newStatus ?? "none"}
            </p>
            {event.reason ? <p className="mt-2 text-sm">{event.reason}</p> : null}
            <p className="mt-2 text-xs text-muted-foreground">{event.targetId}</p>
          </article>
        ))}
        {events.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-5 text-sm text-muted-foreground shadow-soft">
            No moderation events yet.
          </div>
        ) : null}
      </div>
    </section>
  );
}
