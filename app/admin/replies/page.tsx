import Link from "next/link";
import { AdminNav } from "@/components/admin-nav";
import { StatusBadge } from "@/components/status-badge";
import { AdminCalendarView, type DayStats } from "@/components/admin-calendar-view";
import { requireStaff } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { createTranslator } from "@/lib/i18n";
import { getLocalePreference } from "@/lib/preferences";
import { formatDate, excerpt } from "@/lib/utils";
import type { ReplyStatus } from "@/lib/domain";
import type { Prisma } from "@/lib/db";
import {
  MessageSquare,
  ArrowRight,
  User,
  List,
  Calendar as CalendarIcon,
  ArrowUpDown,
  Filter,
  X
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminRepliesPage({
  searchParams
}: {
  searchParams?: Promise<{
    status?: string;
    filter?: string;
    sort?: "asc" | "desc";
    view?: "list" | "calendar";
    date?: string;
    month?: string;
    page?: string;
  }>;
}) {
  const [role, locale] = await Promise.all([requireStaff(), getLocalePreference()]);
  const t = createTranslator(locale);

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const statusParam = resolvedSearchParams?.status;
  const filterParam = resolvedSearchParams?.filter;
  const sortParam = resolvedSearchParams?.sort === "asc" ? "asc" : "desc";
  const viewParam = resolvedSearchParams?.view === "calendar" ? "calendar" : "list";
  const dateParam = resolvedSearchParams?.date;
  const monthParam = resolvedSearchParams?.month;
  const pageParam = Math.max(1, Number(resolvedSearchParams?.page) || 1);
  const PAGE_SIZE = 50;

  // Month navigation calculation
  let calYear = new Date().getFullYear();
  let calMonth = new Date().getMonth();
  if (monthParam) {
    const [y, m] = monthParam.split("-").map(Number);
    if (y && m >= 1 && m <= 12) {
      calYear = y;
      calMonth = m - 1;
    }
  }

  // Build where query
  const whereClause: Prisma.ReplyWhereInput = {};
  if (statusParam && statusParam !== "ALL") {
    whereClause.status = statusParam as ReplyStatus;
  }
  if (filterParam === "today") {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    whereClause.createdAt = { gte: startOfToday };
  }
  if (dateParam) {
    const [dy, dm, dd] = dateParam.split("-").map(Number);
    if (dy && dm && dd) {
      whereClause.createdAt = {
        gte: new Date(dy, dm - 1, dd, 0, 0, 0, 0),
        lte: new Date(dy, dm - 1, dd, 23, 59, 59, 999)
      };
    }
  }

  // Concurrently fetch counts, replies, and month distribution
  const [
    allCount,
    pendingCount,
    approvedCount,
    rejectedCount,
    filteredCount,
    replies,
    monthReplies
  ] = await prisma.$transaction([
    prisma.reply.count(),
    prisma.reply.count({ where: { status: "PENDING" } }),
    prisma.reply.count({ where: { status: "APPROVED" } }),
    prisma.reply.count({ where: { status: "REJECTED" } }),
    prisma.reply.count({ where: whereClause }),
    prisma.reply.findMany({
      where: whereClause,
      include: { letter: true, responder: true },
      orderBy: { createdAt: sortParam },
      take: PAGE_SIZE,
      skip: (pageParam - 1) * PAGE_SIZE
    }),
    prisma.reply.findMany({
      where: {
        createdAt: {
          gte: new Date(calYear, calMonth, 1),
          lte: new Date(calYear, calMonth + 1, 0, 23, 59, 59, 999)
        }
      },
      select: {
        createdAt: true,
        status: true
      }
    })
  ]);

  // Aggregate stats by date for calendar
  const statsByDate: Record<string, DayStats> = {};
  for (const r of monthReplies) {
    const d = new Date(r.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!statsByDate[key]) {
      statsByDate[key] = { total: 0, pending: 0, approved: 0, rejected: 0 };
    }
    statsByDate[key].total++;
    if (r.status === "PENDING") statsByDate[key].pending = (statsByDate[key].pending || 0) + 1;
    else if (r.status === "APPROVED") statsByDate[key].approved = (statsByDate[key].approved || 0) + 1;
    else if (r.status === "REJECTED") statsByDate[key].rejected = (statsByDate[key].rejected || 0) + 1;
  }

  // URL Helper
  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));
  const currentParamsRecord: Record<string, string | undefined> = {
    status: statusParam,
    filter: filterParam,
    sort: sortParam !== "desc" ? sortParam : undefined,
    view: viewParam !== "list" ? viewParam : undefined,
    date: dateParam,
    month: monthParam,
    page: pageParam > 1 ? String(pageParam) : undefined
  };

  const buildUrl = (changes: Record<string, string | undefined>) => {
    const merged = { ...currentParamsRecord, ...changes };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== "") {
        sp.set(k, v);
      }
    }
    const q = sp.toString();
    return q ? `/admin/replies?${q}` : "/admin/replies";
  };

  const statusChips = [
    { key: "ALL", label: t("admin.statusAll"), count: allCount },
    { key: "PENDING", label: t("status.PENDING"), count: pendingCount },
    { key: "APPROVED", label: t("status.APPROVED"), count: approvedCount },
    { key: "REJECTED", label: t("status.REJECTED"), count: rejectedCount }
  ];

  const hasActiveFilters = Boolean(statusParam || filterParam || dateParam);

  const getStatusTone = (status: ReplyStatus) => {
    switch (status) {
      case "APPROVED":
        return "good";
      case "REJECTED":
        return "danger";
      case "PENDING":
      default:
        return "warning";
    }
  };

  return (
    <section className="mx-auto max-w-5xl py-2 sm:py-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/15 text-accent">
            <MessageSquare className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("admin.repliesTitle")}</h1>
              <StatusBadge tone={replies.length > 0 ? "warning" : "good"}>
                {t("admin.countUnit", { count: String(replies.length) })}
              </StatusBadge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("admin.repliesSubtitle")}
            </p>
          </div>
        </div>

        {/* View Switcher & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* List vs Calendar View Toggle */}
          <div className="flex items-center rounded-xl border border-border/80 bg-surface p-1 shadow-2xs">
            <Link
              href={buildUrl({ view: "list" })}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                viewParam === "list"
                  ? "bg-accent text-accent-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>{t("admin.viewList")}</span>
            </Link>
            <Link
              href={buildUrl({ view: "calendar" })}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                viewParam === "calendar"
                  ? "bg-accent text-accent-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>{t("admin.viewCalendar")}</span>
            </Link>
          </div>

          {/* Date/Time Sorting Toggle */}
          <div className="flex items-center rounded-xl border border-border/80 bg-surface p-1 shadow-2xs">
            <Link
              href={buildUrl({ sort: "desc" })}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                sortParam === "desc"
                  ? "bg-muted font-bold text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={t("admin.sortNewest")}
            >
              <ArrowUpDown className="h-3 w-3" />
              <span>{t("admin.sortNewest")}</span>
            </Link>
            <Link
              href={buildUrl({ sort: "asc" })}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
                sortParam === "asc"
                  ? "bg-muted font-bold text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={t("admin.sortOldest")}
            >
              <ArrowUpDown className="h-3 w-3" />
              <span>{t("admin.sortOldest")}</span>
            </Link>
          </div>
        </div>
      </div>

      <AdminNav role={role} />

      {/* Filter Chips Bar */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            <span>{t("admin.filterStatus")}:</span>
          </span>

          {statusChips.map((chip) => {
            const isSelected = (!statusParam && chip.key === "ALL") || statusParam === chip.key;
            return (
              <Link
                key={chip.key}
                href={buildUrl({ status: chip.key === "ALL" ? undefined : chip.key })}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  isSelected
                    ? "border border-accent bg-accent text-accent-foreground shadow-2xs"
                    : "border border-border/80 bg-surface text-muted-foreground hover:border-accent/40 hover:text-foreground"
                }`}
              >
                <span>{chip.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-mono ${
                    isSelected ? "bg-accent-foreground/20 text-accent-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {chip.count}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Active Specific Filters */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-2 text-xs">
            <span className="font-semibold text-muted-foreground">{t("admin.activeFiltersLabel")}</span>

            {statusParam && statusParam !== "ALL" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-0.5 border border-border/80 font-medium text-foreground">
                {t("admin.filterStatusLabel")}: {t(`status.${statusParam}`)}
                <Link href={buildUrl({ status: undefined })} className="hover:text-danger">
                  <X className="h-3 w-3" />
                </Link>
              </span>
            )}

            {filterParam === "today" && (
              <span className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-0.5 border border-border/80 font-medium text-foreground">
                {t("admin.filterToday")}
                <Link href={buildUrl({ filter: undefined })} className="hover:text-danger">
                  <X className="h-3 w-3" />
                </Link>
              </span>
            )}

            {dateParam && (
              <span className="inline-flex items-center gap-1 rounded-md bg-surface px-2 py-0.5 border border-border/80 font-medium text-foreground">
                {t("admin.filterDateLabel")}: {dateParam}
                <Link href={buildUrl({ date: undefined })} className="hover:text-danger">
                  <X className="h-3 w-3" />
                </Link>
              </span>
            )}

            <Link
              href="/admin/replies"
              className="ml-auto font-semibold text-accent hover:underline"
            >
              {t("admin.clearFilters")}
            </Link>
          </div>
        )}
      </div>

      {/* Calendar View Component */}
      {viewParam === "calendar" && (
        <div className="mb-6">
          <AdminCalendarView
            year={calYear}
            month={calMonth}
            selectedDate={dateParam}
            statsByDate={statsByDate}
            baseUrl="/admin/replies"
            currentParams={currentParamsRecord}
            t={t}
          />
        </div>
      )}

      {/* Replies Items List */}
      <div className="space-y-3.5">
        {dateParam && (
          <div className="flex items-center justify-between rounded-xl bg-accent/10 px-4 py-2.5 text-xs text-accent">
            <span className="font-semibold">{t("admin.selectedDate", { date: dateParam })}</span>
            <span className="font-mono">{t("admin.showingItemsCount", { count: String(replies.length) })}</span>
          </div>
        )}

        {replies.map((reply) => (
          <Link
            key={reply.id}
            href={`/admin/replies/${reply.id}`}
            className="group block rounded-2xl border border-border/80 bg-surface p-5 shadow-soft transition-all hover:border-accent/40 hover:shadow-tactile"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-2.5">
              <div className="flex items-center gap-2">
                <StatusBadge tone={getStatusTone(reply.status)}>
                  {t(`status.${reply.status}`)}
                </StatusBadge>
                <span className="text-xs text-muted-foreground">{formatDate(reply.createdAt)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5 text-accent" />
                <span>{reply.responder.anonymousHandle}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">
                  {t("admin.trustScorePrefix")} {reply.responder.trustScore}
                </span>
              </div>
            </div>

            <p className="mt-3 font-letter text-sm leading-relaxed text-foreground">
              {excerpt(reply.coachedText)}
            </p>

            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-letter line-clamp-1 italic text-muted-foreground/80">
                {t("admin.originalLetterPrefix")} &quot;{excerpt(reply.letter.processedText, 60)}&quot;
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-accent group-hover:translate-x-0.5 transition-transform">
                {t("admin.reviewReplyAction")} <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/60 pt-4 text-xs">
            <span className="text-muted-foreground">
              {t("admin.paginationSummary", {
                total: String(filteredCount),
                start: String((pageParam - 1) * PAGE_SIZE + 1),
                end: String(Math.min(filteredCount, pageParam * PAGE_SIZE)),
                page: String(pageParam),
                totalPages: String(totalPages)
              })}
            </span>
            <div className="flex items-center gap-2">
              {pageParam > 1 ? (
                <Link
                  href={buildUrl({ page: String(pageParam - 1) })}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 font-medium hover:border-accent/40 hover:text-foreground transition-colors"
                >
                  {t("admin.paginationPrev")}
                </Link>
              ) : null}
              {pageParam < totalPages ? (
                <Link
                  href={buildUrl({ page: String(pageParam + 1) })}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 font-medium hover:border-accent/40 hover:text-foreground transition-colors"
                >
                  {t("admin.paginationNext")}
                </Link>
              ) : null}
            </div>
          </div>
        )}

        {replies.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-surface/60 p-10 text-center text-sm text-muted-foreground shadow-soft">
            <p className="font-medium text-foreground">{dateParam ? t("admin.noRepliesOnDate") : t("admin.noPendingReplies")}</p>
            {hasActiveFilters && (
              <div className="mt-3">
                <Link
                  href="/admin/replies"
                  className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-accent hover:bg-surface"
                >
                  {t("admin.clearFilters")}
                </Link>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
