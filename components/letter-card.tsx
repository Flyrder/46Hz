import Link from "next/link";
import { Clock, MessageCircleHeart, Sparkles } from "lucide-react";
import type { LetterStatus, ReplyType, RiskLevel } from "@/lib/domain";
import { formatTag } from "@/lib/i18n";
import { shouldMaskLetterContent } from "@/lib/safety/routing";
import { excerpt, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";

export function LetterCard({
  letter,
  href,
  mode = "writer",
  isResonanceRecommended = false,
  resonanceReason,
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
    maxReplies?: number;
    _count?: { replies: number };
    createdAt: Date;
  };
  href: string;
  mode?: "writer" | "responder" | "admin";
  isResonanceRecommended?: boolean;
  resonanceReason?: string;
  t?: (key: string) => string;
}) {
  const maskContent = mode !== "admin" && shouldMaskLetterContent(letter);
  const preview = maskContent
    ? t("letter.masked")
    : excerpt(letter.processedText);

  const replyCount = letter._count?.replies;

  return (
    <Link
      href={href}
      className={`group block rounded-2xl border bg-surface p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-tactile active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2 ${
        isResonanceRecommended
          ? "border-accent/40 ring-1 ring-accent/15 bg-gradient-to-b from-surface to-accent/[0.03]"
          : "border-border/85 hover:border-accent/40"
      }`}
    >
      {/* Top Header: Metadata & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {isResonanceRecommended && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-accent/20 to-teal-500/20 border border-accent/40 px-2.5 py-0.5 text-[11px] font-semibold text-accent shadow-2xs">
              <Sparkles className="h-3 w-3 text-accent" />
              <span>{t("reply.aiResonanceBadge")}</span>
            </span>
          )}
          <StatusBadge tone={letter.status === "APPROVED" ? "good" : "neutral"}>
            {t(`status.${letter.status}`)}
          </StatusBadge>
          <StatusBadge tone={letter.riskLevel === "NORMAL" ? "good" : "warning"}>
            {t(`status.${letter.riskLevel}`)}
          </StatusBadge>
          {letter.maxReplies ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-medium text-accent">
              <Sparkles className="h-3 w-3" />
              <span>{letter.maxReplies >= 15 ? t("resonance.expandedBadge") : t("resonance.seventhBadge")}</span>
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5 opacity-70" />
          <time dateTime={new Date(letter.createdAt).toISOString()}>{formatDate(letter.createdAt)}</time>
        </div>
      </div>

      {/* Preview Text */}
      <p className="mt-3.5 text-sm leading-relaxed text-foreground/90 font-normal line-clamp-3 break-words">
        {preview}
      </p>

      {/* AI Resonance Match Reason */}
      {isResonanceRecommended && resonanceReason ? (
        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-accent/20 bg-accent/5 px-2.5 py-1 text-xs text-accent">
          <Sparkles className="h-3 w-3 shrink-0" aria-hidden="true" />
          <span className="font-sans text-[11px] font-medium leading-tight">{resonanceReason}</span>
        </div>
      ) : null}

      {/* Footer: Desired Reply Type & Emotional Tags */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
          <span className="inline-flex items-center rounded-md bg-muted/60 px-2 py-0.5 font-medium text-foreground/80">
            {t(`replyType.${letter.desiredReplyType}`)}
          </span>
          {letter.emotionTags.length > 0 && (
            <span className="text-muted-foreground/80">
              {letter.emotionTags.map((tag) => `#${formatTag(tag, t)}`).join(" ")}
            </span>
          )}
          {mode !== "writer" && letter.situationTags.length > 0 && (
            <span className="text-muted-foreground/60 hidden sm:inline">
              · {letter.situationTags.map((tag) => formatTag(tag, t)).join(", ")}
            </span>
          )}
        </div>

        {replyCount !== undefined && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-accent">
            <MessageCircleHeart className="h-3.5 w-3.5" />
            <span>{replyCount}</span>
          </span>
        )}
      </div>
    </Link>
  );
}
