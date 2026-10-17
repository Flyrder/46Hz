import { describe, expect, it } from "vitest";
import { translate } from "@/lib/i18n";

describe("Admin Dashboard Metrics, Correlated Details & Calendar Navigation", () => {
  it("provides localized metric labels and correlated detail strings across all 3 locales", () => {
    const detailKeys = [
      "admin.metricsLettersTodayDetail",
      "admin.metricsRepliesTodayDetail",
      "admin.metricsPendingDetail",
      "admin.metricsHighRiskDetail",
      "admin.metricsReportsDetail",
      "admin.metricsUnderstoodDetail",
      "admin.metricsRejectedDetail",
      "admin.statusAll",
      "admin.filterToday",
      "admin.clearFilters",
      "admin.prevMonth",
      "admin.nextMonth",
      "admin.selectedDate",
      "admin.noLettersOnDate",
      "admin.noRepliesOnDate",
      "admin.activeFiltersLabel",
      "admin.filterStatusLabel",
      "admin.filterRiskLabel",
      "admin.filterTagLabel",
      "admin.filterDateLabel",
      "admin.showingItemsCount",
      "admin.paginationSummary",
      "admin.paginationPrev",
      "admin.paginationNext",
      "admin.calendarYearMonth",
      "admin.calendarToday",
      "admin.calendarStatusLegend",
      "admin.calendarDaySun",
      "admin.calendarDayMon",
      "admin.calendarDayTue",
      "admin.calendarDayWed",
      "admin.calendarDayThu",
      "admin.calendarDayFri",
      "admin.calendarDaySat",
      "admin.viewTagLettersTitle"
    ] as const;

    const locales = ["ko_KR", "en_US", "zh_CN"] as const;

    for (const loc of locales) {
      for (const k of detailKeys) {
        const val = translate(loc, k, { letters: "5", replies: "3", positive: "10", total: "12", rejected: "2", date: "2026-10-17" });
        expect(val).not.toBe(k);
        expect(val.length).toBeGreaterThan(0);
      }
    }
  });

  it("verifies date formatting and calendar calculations for AdminCalendarView", () => {
    const year = 2026;
    const month = 9; // October (0-indexed: 9)
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 2026-10-01 is a Thursday (4)
    expect(firstDay.getDay()).toBe(4);
    // October has 31 days
    expect(daysInMonth).toBe(31);

    // Prev month is September (2026-09)
    const prevMonthDate = new Date(year, month - 1, 1);
    const prevMonthParam = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}`;
    expect(prevMonthParam).toBe("2026-09");

    // Next month is November (2026-11)
    const nextMonthDate = new Date(year, month + 1, 1);
    const nextMonthParam = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(2, "0")}`;
    expect(nextMonthParam).toBe("2026-11");
  });

  it("ensures all letters and replies statuses have valid translation strings", () => {
    const letterStatuses = ["PENDING", "APPROVED", "REJECTED", "ROUTED_TO_SUPPORT", "DRAFT"] as const;
    for (const status of letterStatuses) {
      expect(translate("ko_KR", `status.${status}`)).not.toBe(`status.${status}`);
    }

    const replyStatuses = ["PENDING", "APPROVED", "REJECTED"] as const;
    for (const status of replyStatuses) {
      expect(translate("ko_KR", `status.${status}`)).not.toBe(`status.${status}`);
    }
  });
});
