import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { StatusBadge } from "@/components/status-badge";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  await requireAdmin();
  const reports = await prisma.feedback.findMany({
    where: { reportReason: { not: null } },
    include: {
      reply: {
        include: {
          letter: true,
          responder: true
        }
      },
      fromUser: true
    },
    orderBy: { createdAt: "desc" },
    take: 50
  });

  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold">Reports</h1>
      <AdminNav />
      <div className="space-y-4">
        {reports.map((report) => (
          <article key={report.id} className="rounded-lg border border-border bg-surface p-5 shadow-soft">
            <div className="flex flex-wrap gap-2">
              <StatusBadge tone="warning">reported</StatusBadge>
              <StatusBadge>{formatDate(report.createdAt)}</StatusBadge>
            </div>
            <p className="mt-3 text-sm leading-6">{report.reportReason}</p>
            <div className="mt-4 text-sm text-muted-foreground">
              From {report.fromUser.anonymousHandle} about{" "}
              <Link className="font-semibold text-accent" href={`/admin/replies/${report.replyId}`}>
                reply {report.replyId.slice(0, 6)}
              </Link>
            </div>
          </article>
        ))}
        {reports.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface p-5 text-sm text-muted-foreground shadow-soft">
            No reports have been submitted.
          </div>
        ) : null}
      </div>
    </section>
  );
}
