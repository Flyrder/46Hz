import Link from "next/link";
import type { LetterStatus, ReplyType, RiskLevel } from "@/lib/domain";
import { shouldMaskLetterContent } from "@/lib/safety/routing";
import { excerpt, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";

export function LetterCard({
  letter,
  href,
  mode = "writer",
  t = (key: string) => key
}: {
  letter: {
    id: string;
    processedText: string;
    emotionTags: string[];
    situationTags: string[];
    desiredReplyType: ReplyType;
    riskLevel: RiskLevel;
    status: LetterStatus;
    createdAt: Date;
  };
  href: string;
  mode?: "writer" | "responder" | "admin";
  t?: (key: string) => string;
}) {
  const maskContent = mode !== "admin" && shouldMaskLetterContent(letter);
  const preview = maskContent
    ? t("letter.masked")
    : excerpt(letter.processedText);

  return (
    <Link
      href={href}
      className="block rounded-lg border border-border bg-surface p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-accent/40"
    >
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={letter.status === "APPROVED" ? "good" : "neutral"}>
          {t(`status.${letter.status}`)}
        </StatusBadge>
        <StatusBadge tone={letter.riskLevel === "NORMAL" ? "good" : "warning"}>
          {t(`status.${letter.riskLevel}`)}
        </StatusBadge>
        <span className="text-xs text-muted-foreground">{formatDate(letter.createdAt)}</span>
      </div>
      <p className="mt-4 text-sm leading-6 text-foreground">{preview}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span>{t(`replyType.${letter.desiredReplyType}`)}</span>
        <span aria-hidden="true">/</span>
        <span>{letter.emotionTags.join(", ")}</span>
        {mode !== "writer" ? (
          <>
            <span aria-hidden="true">/</span>
            <span>{letter.situationTags.join(", ")}</span>
          </>
        ) : null}
      </div>
    </Link>
  );
}
