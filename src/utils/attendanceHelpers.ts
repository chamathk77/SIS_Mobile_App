import {
  AttendanceRecord,
  AttendanceStatus,
  AttendanceSummary,
} from "../type/attendance";

export type AttendanceDateRange = {
  from: Date;
  to: Date;
};

export function formatDateForApi(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function clampDateToToday(date: Date): Date {
  const today = getToday();
  const normalized = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  return normalized > today ? today : normalized;
}

export function getMonthDateRange(reference = new Date()): AttendanceDateRange {
  const today = getToday();
  const from = new Date(reference.getFullYear(), reference.getMonth(), 1);
  const monthEnd = new Date(reference.getFullYear(), reference.getMonth() + 1, 0);
  const to = monthEnd > today ? today : monthEnd;
  return { from, to };
}

export function applyAttendanceDateChange(
  start: Date,
  end: Date,
  changed: "start" | "end",
  newDate: Date,
): AttendanceDateRange {
  const today = getToday();
  let nextStart = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  let nextEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate());

  if (changed === "start") {
    nextStart = clampDateToToday(newDate);
    if (nextEnd > today) {
      nextEnd = today;
    }
    if (nextStart > nextEnd) {
      nextEnd = nextStart;
    }
  } else {
    nextEnd = clampDateToToday(newDate);
    if (nextEnd < nextStart) {
      nextStart = nextEnd;
    }
  }

  return { from: nextStart, to: nextEnd };
}

export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateRangeLabel(range: AttendanceDateRange): string {
  return `${formatDateForDisplay(range.from)} – ${formatDateForDisplay(range.to)}`;
}

export function isSameDateRange(
  a: AttendanceDateRange,
  b: AttendanceDateRange,
): boolean {
  return (
    formatDateForApi(a.from) === formatDateForApi(b.from) &&
    formatDateForApi(a.to) === formatDateForApi(b.to)
  );
}

export function formatAttendanceDate(isoDate: string): string {
  if (!isoDate?.trim()) {
    return "—";
  }

  const parts = isoDate.split("-");
  if (parts.length !== 3) {
    return isoDate;
  }

  const [year, month, day] = parts.map(Number);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** API summary often omits `excused`; derive from totals or loaded records. */
export function getExcusedCount(
  summary: AttendanceSummary,
  records?: AttendanceRecord[],
): number {
  if (typeof summary.excused === "number") {
    return summary.excused;
  }

  const derived =
    summary.total - summary.present - summary.absent - summary.late;
  if (derived > 0) {
    return derived;
  }

  if (records?.length) {
    return records.filter(
      (record) => String(record.status).toLowerCase() === "excused",
    ).length;
  }

  return 0;
}

export function formatAttendanceStatus(status: AttendanceStatus): string {
  if (!status) {
    return "Unknown";
  }
  const s = String(status).trim();
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export type AttendanceStatusColors = {
  background: string;
  text: string;
};

export function getAttendanceStatusColors(
  status: AttendanceStatus,
  theme: {
    successContainer: string;
    onSuccessContainer: string;
    errorContainer: string;
    onErrorContainer: string;
    tertiaryContainer: string;
    onTertiaryContainer: string;
    secondaryContainer: string;
    onSecondaryContainer: string;
    surfaceVariant: string;
    onSurfaceVariant: string;
  },
): AttendanceStatusColors {
  const key = String(status).toLowerCase();

  switch (key) {
    case "present":
      return {
        background: theme.successContainer,
        text: theme.onSuccessContainer,
      };
    case "absent":
      return {
        background: theme.errorContainer,
        text: theme.onErrorContainer,
      };
    case "late":
      return {
        background: theme.tertiaryContainer,
        text: theme.onTertiaryContainer,
      };
    case "excused":
      return {
        background: theme.secondaryContainer,
        text: theme.onSecondaryContainer,
      };
    default:
      return {
        background: theme.surfaceVariant,
        text: theme.onSurfaceVariant,
      };
  }
}
