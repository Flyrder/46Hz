import { notFound } from "next/navigation";
import { moderateReplyAction } from "@/app/actions/admin";
import { AdminNav } from "@/components/admin-nav";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminReplyDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const reply = await prisma.reply.findUnique({
    where: { id },
    include: {
      letter: true,
      responder: true
    }
  });

  if (!reply) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-semibold">Reply review</h1>
      <AdminNav />
      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <article className="rounded-lg border border-border bg-surface p-5 shadow-soft">
          <div className="flex flex-wrap gap-2">
            <StatusBadge>{reply.status.toLowerCase()}</StatusBadge>
            <StatusBadge>{formatDate(reply.createdAt)}</StatusBadge>
          </div>
          <h2 className="mt-6 text-sm font-semibold">Coached reply</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{reply.coachedText}</p>
          <h2 className="mt-6 text-sm font-semibold">Raw reply</h2>
          <p className="mt-2 whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm leading-7">{reply.rawText}</p>
          <h2 className="mt-6 text-sm font-semibold">Letter context</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {reply.letter.processedText}
          </p>
        </article>
        <form action={moderateReplyAction} className="rounded-lg border border-border bg-surface p-5 shadow-soft">
          <input type="hidden" name="replyId" value={reply.id} />
          <label className="text-sm font-semibold" htmlFor="status">
            Status
          </label>
          <select id="status" name="status" defaultValue={reply.status} className="mt-2 w-full rounded-lg border border-border px-3 py-3">
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <label className="mt-4 block text-sm font-semibold" htmlFor="reason">
            Reason
          </label>
          <textarea id="reason" name="reason" rows={3} className="mt-2 w-full rounded-lg border border-border p-3" />
          <div className="mt-4">
            <SubmitButton>Save moderation</SubmitButton>
          </div>
        </form>
      </div>
    </section>
  );
}
