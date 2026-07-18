import { notFound } from "next/navigation";
import { ReplyComposer } from "@/components/reply-composer";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { isPeerMatchable } from "@/lib/safety/routing";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ReplyLetterPage({
  params
}: {
  params: Promise<{ letterId: string }>;
}) {
  const [user, locale] = await Promise.all([requireUser(), getLocalePreference()]);
  const t = createTranslator(locale);
  const { letterId } = await params;
  const letter = await prisma.letter.findUnique({
    where: { id: letterId }
  });

  if (
    !letter ||
    letter.authorId === user.id ||
    !isPeerMatchable({ status: letter.status, riskLevel: letter.riskLevel })
  ) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-semibold">{t("reply.title")}</h1>
      <article className="mt-5 rounded-lg border border-border bg-surface p-5 shadow-soft">
        <div className="flex flex-wrap gap-2">
          <StatusBadge>{t(`replyType.${letter.desiredReplyType}`)}</StatusBadge>
          {letter.emotionTags.map((tag) => (
            <StatusBadge key={tag}>{tag}</StatusBadge>
          ))}
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-7">{letter.processedText}</p>
      </article>

      <div className="mt-5 rounded-lg border border-border bg-surface p-5 text-sm leading-6 text-muted-foreground shadow-soft">
        {t("reply.guidance")}
      </div>

      <div className="mt-6">
        <ReplyComposer
          letterId={letter.id}
          labels={{
            coach: t("reply.coach"),
            coachSuggestions: t("reply.coachSuggestions"),
            finalReply: t("reply.final"),
            flags: t("reply.flags"),
            placeholder: t("reply.placeholder"),
            send: t("reply.send"),
            startOver: t("reply.startOver"),
            yourReply: t("reply.yourReply")
          }}
        />
      </div>
    </section>
  );
}
