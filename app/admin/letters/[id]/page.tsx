import { notFound } from "next/navigation";
import { moderateLetterAction, overrideLetterRiskAction } from "@/app/actions/admin";
import { AdminNav } from "@/components/admin-nav";
import { StatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/ui/submit-button";
import { letterStatusLabels, replyTypeLabels, riskLevelLabels } from "@/lib/domain";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminLetterDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const letter = await prisma.letter.findUnique({
    where: { id },
    include: {
      author: true,
      replies: true
    }
  });

  if (!letter) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-semibold">Letter review</h1>
      <AdminNav />
      <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
        <article className="rounded-lg border border-border bg-surface p-5 shadow-soft">
          <div className="flex flex-wrap gap-2">
            <StatusBadge>{letterStatusLabels[letter.status]}</StatusBadge>
            <StatusBadge tone={letter.riskLevel === "NORMAL" ? "good" : "warning"}>
              {riskLevelLabels[letter.riskLevel]}
            </StatusBadge>
            <StatusBadge>{replyTypeLabels[letter.desiredReplyType]}</StatusBadge>
          </div>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="font-semibold">Author</dt>
              <dd className="mt-1 text-muted-foreground">
                {letter.author.anonymousHandle} / trust {letter.author.trustScore}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Created</dt>
              <dd className="mt-1 text-muted-foreground">{formatDate(letter.createdAt)}</dd>
            </div>
            <div>
              <dt className="font-semibold">Tags</dt>
              <dd className="mt-1 text-muted-foreground">
                {letter.emotionTags.join(", ")} / {letter.situationTags.join(", ")}
              </dd>
            </div>
          </dl>
          <h2 className="mt-6 text-sm font-semibold">Processed text</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7">{letter.processedText}</p>
          <h2 className="mt-6 text-sm font-semibold">Raw text</h2>
          <p className="mt-2 whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm leading-7">{letter.rawText}</p>
        </article>

        <div className="space-y-4">
          <form action={moderateLetterAction} className="rounded-lg border border-border bg-surface p-5 shadow-soft">
            <input type="hidden" name="letterId" value={letter.id} />
            <label className="text-sm font-semibold" htmlFor="status">
              Status
            </label>
            <select id="status" name="status" defaultValue={letter.status} className="mt-2 w-full rounded-lg border border-border px-3 py-3">
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ROUTED_TO_SUPPORT">Routed to support</option>
            </select>
            <label className="mt-4 block text-sm font-semibold" htmlFor="riskLevel">
              Risk level
            </label>
            <select id="riskLevel" name="riskLevel" defaultValue={letter.riskLevel} className="mt-2 w-full rounded-lg border border-border px-3 py-3">
              <option value="NORMAL">Normal</option>
              <option value="SENSITIVE">Sensitive</option>
              <option value="HIGH">High</option>
              <option value="BLOCKED">Blocked</option>
            </select>
            <label className="mt-4 block text-sm font-semibold" htmlFor="reason">
              Reason
            </label>
            <textarea id="reason" name="reason" rows={3} className="mt-2 w-full rounded-lg border border-border p-3" />
            <div className="mt-4">
              <SubmitButton>Save moderation</SubmitButton>
            </div>
          </form>

          <form action={overrideLetterRiskAction} className="rounded-lg border border-border bg-surface p-5 shadow-soft">
            <input type="hidden" name="letterId" value={letter.id} />
            <label className="text-sm font-semibold" htmlFor="risk-override">
              Quick risk override
            </label>
            <select id="risk-override" name="riskLevel" defaultValue={letter.riskLevel} className="mt-2 w-full rounded-lg border border-border px-3 py-3">
              <option value="NORMAL">Normal</option>
              <option value="SENSITIVE">Sensitive</option>
              <option value="HIGH">High</option>
              <option value="BLOCKED">Blocked</option>
            </select>
            <input type="hidden" name="reason" value="Admin risk override from detail page" />
            <div className="mt-4">
              <SubmitButton variant="secondary">Override risk</SubmitButton>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
