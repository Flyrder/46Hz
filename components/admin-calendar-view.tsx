import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check } from "lucide-react";

export type DayStats = {
  total: number;
  pending?: number;
  approved?: number;
  rejected?: number;
  routed?: number;
};

export function AdminCalendarView({
  year,
  month, // 0-indexed (0 = Jan, 9 = Oct, etc.)
  selectedDate, // "YYYY-MM-DD"
  statsByDate,
  baseUrl,
  currentParams,
  t
}: {
  year: number;
  month: number;
  selectedDate?: string;
  statsByDate: Record<string, DayStats>;
  baseUrl: string;
  currentParams: Record<string, string | undefined>;
  t: (key: string, vars?: Record<string, string>) => string;
}) {
  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDate = new Date(year, month - 1, 1);
  const nextMonthDate = new Date(year, month + 1, 1);

  const prevMonthParam = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const nextMonthParam = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}`;

  const todayStr = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  })();

  const buildUrl = (newParams: Record<string, string | undefined>) => {
    const merged = { ...currentParams, ...newParams };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v !== undefined && v !== "") {
        sp.set(k, v);
      }
    }
    const q = sp.toString();
    return q ? `${baseUrl}?${q}` : baseUrl;
  };

  const dayNames = [
    t("admin.calendarDaySun"),
    t("admin.calendarDayMon"),
    t("admin.calendarDayTue"),
    t("admin.calendarDayWed"),
    t("admin.calendarDayThu"),
    t("admin.calendarDayFri"),
    t("admin.calendarDaySat")
  ];

  return (
    <div className="rounded-2xl border border-border/80 bg-surface p-4 sm:p-6 shadow-soft">
      {/* Calendar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-accent" aria-hidden="true" />
          <h2 className="text-base font-bold text-foreground">
            {t("admin.calendarYearMonth", { year: String(year), month: String(month + 1) })}
          </h2>
          {selectedDate && (
            <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-semibold text-accent">
              {t("admin.selectedDate", { date: selectedDate })}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selectedDate && (
            <Link
              href={buildUrl({ date: undefined })}
              className="rounded-lg border border-border/80 bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:border-accent/40 hover:text-foreground transition-colors"
            >
              {t("admin.calendarAllDates")}
            </Link>
          )}

          <div className="flex items-center gap-1">
            <Link
              href={buildUrl({ month: prevMonthParam, date: undefined })}
              aria-label={t("admin.prevMonth")}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-background text-muted-foreground hover:border-accent/40 hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <Link
              href={buildUrl({ month: nextMonthParam, date: undefined })}
              aria-label={t("admin.nextMonth")}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/80 bg-background text-muted-foreground hover:border-accent/40 hover:text-foreground transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="mt-4 grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-semibold text-muted-foreground">
        {dayNames.map((name, i) => (
          <div key={name} className={`py-1 ${i === 0 ? "text-rose-500/80" : i === 6 ? "text-blue-500/80" : ""}`}>
            {name}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="mt-2 grid grid-cols-7 gap-1 sm:gap-2">
        {/* Leading empty cells */}
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="min-h-[58px] sm:min-h-[68px] rounded-xl bg-muted/20 opacity-30" />
        ))}

        {/* Month Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          const isSelected = selectedDate === dateKey;
          const isToday = todayStr === dateKey;
          const stats = statsByDate[dateKey];
          const hasItems = stats && stats.total > 0;

          const targetUrl = buildUrl({
            date: isSelected ? undefined : dateKey
          });

          return (
            <Link
              key={dateKey}
              href={targetUrl}
              className={`group relative flex min-h-[58px] sm:min-h-[68px] flex-col justify-between rounded-xl border p-1.5 sm:p-2 transition-all ${
                isSelected
                  ? "border-accent bg-accent/15 ring-2 ring-accent/30 shadow-tactile"
                  : isToday
                  ? "border-accent/50 bg-accent/5 hover:border-accent hover:bg-accent/10"
                  : hasItems
                  ? "border-border/80 bg-surface hover:border-accent/50 hover:bg-surface hover:shadow-soft"
                  : "border-border/40 bg-background/40 text-muted-foreground/60 hover:border-border/80 hover:bg-surface"
              }`}
            >
              {/* Day Number and Today Indicator */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-semibold ${
                    isSelected
                      ? "text-accent font-bold"
                      : isToday
                      ? "text-accent"
                      : "text-foreground group-hover:text-foreground"
                  }`}
                >
                  {dayNum}
                </span>

                {isToday && (
                  <span className="h-1.5 w-1.5 rounded-full bg-accent ring-2 ring-accent/30" title={t("admin.calendarToday")} />
                )}
              </div>

              {/* Day Counts & Status Dots */}
              {hasItems ? (
                <div className="mt-1 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded px-1 text-[10px] font-bold font-mono ${
                        isSelected
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      {t("admin.countUnit", { count: String(stats.total) })}
                    </span>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {stats.pending ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title={`${t("status.PENDING")} ${t("admin.countUnit", { count: String(stats.pending) })}`} />
                    ) : null}
                    {stats.approved ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title={`${t("status.APPROVED")} ${t("admin.countUnit", { count: String(stats.approved) })}`} />
                    ) : null}
                    {stats.rejected ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-rose-500" title={`${t("status.REJECTED")} ${t("admin.countUnit", { count: String(stats.rejected) })}`} />
                    ) : null}
                    {stats.routed ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-purple-500" title={`${t("status.ROUTED_TO_SUPPORT")} ${t("admin.countUnit", { count: String(stats.routed) })}`} />
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="h-3" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/50 pt-3 text-[11px] text-muted-foreground">
        <span className="font-semibold text-foreground">{t("admin.calendarStatusLegend")}</span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          <span>{t("status.PENDING")}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>{t("status.APPROVED")}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span>{t("status.REJECTED")}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-purple-500" />
          <span>{t("status.ROUTED_TO_SUPPORT")}</span>
        </span>
      </div>
    </div>
  );
}
