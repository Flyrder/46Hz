import { suspendUserAction } from "@/app/actions/admin";
import { AdminNav } from "@/components/admin-nav";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireAdmin();
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
    <section className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-semibold">Anonymous users</h1>
      <AdminNav />
      <div className="space-y-3">
        {users.map((user) => (
          <article key={user.id} className="rounded-lg border border-border bg-surface p-4 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold">{user.anonymousHandle}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {formatDate(user.createdAt)} / trust {user.trustScore} / {user._count.letters} letters / {user._count.replies} replies
                </div>
              </div>
              {user.suspendedAt ? <StatusBadge tone="danger">suspended</StatusBadge> : <StatusBadge tone="good">active</StatusBadge>}
            </div>
            {!user.suspendedAt ? (
              <form action={suspendUserAction} className="mt-4 flex flex-wrap gap-2">
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="reason" value="Suspended from admin user list" />
                <SubmitButton variant="danger">Suspend</SubmitButton>
              </form>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
