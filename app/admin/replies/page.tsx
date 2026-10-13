import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { StatusBadge } from "@/components/status-badge";
import { requireStaff } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { formatDate, excerpt } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminRepliesPage() {
  const role = await requireStaff();
  const replies = await prisma.reply.findMany({
    where: { status: "PENDING" },
    include: { letter: true, responder: true },
    orderBy: { createdAt: "asc" },
    take: 50
  });

  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold">Pending replies</h1>
      <AdminNav role={role} />
      <div className="space-y-4">
        {replies.map((reply) => (
          <Link key={reply.id} href={`/admin/replies/${reply.id}`} className="block rounded-lg border border-border bg-surface p-5 shadow-soft hover:border-accent/40">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge>{reply.status.toLowerCase()}</StatusBadge>
              <span className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</span>
            </div>
            <p className="mt-3 text-sm leading-6">{excerpt(reply.coachedText)}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Responder {reply.responder.anonymousHandle} / trust {reply.responder.trustScore}
            </p>
          </Link>
        ))}
        {replies.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-5 text-sm text-muted-foreground shadow-soft">
            No replies are waiting for review.
          </div>
        ) : null}
      </div>
    </section>
  );
}
