import {
  DayOfWeek,
  TimetableData,
  TimetableSlot,
} from "../type/timetable";

export const WEEKDAY_ORDER: DayOfWeek[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/** Eschola API: Monday=1 … Friday=5, Saturday=6, Sunday=0 */
const NUMERIC_DAY_MAP: Record<number, DayOfWeek> = {
  0: "sunday",
  1: "monday",
  2: "tuesday",
  3: "wednesday",
  4: "thursday",
  5: "friday",
  6: "saturday",
  7: "sunday",
};

const STRING_DAY_MAP: Record<string, DayOfWeek> = {
  sunday: "sunday",
  monday: "monday",
  tuesday: "tuesday",
  wednesday: "wednesday",
  thursday: "thursday",
  friday: "friday",
  saturday: "saturday",
};

export function parseDayOfWeek(
  value: number | string | undefined | null,
): DayOfWeek | null {
  if (value == null || value === "") {
    return null;
  }
  if (typeof value === "string") {
    const key = value.trim().toLowerCase();
    if (STRING_DAY_MAP[key]) {
      return STRING_DAY_MAP[key];
    }
    const asNumber = Number(key);
    if (!Number.isNaN(asNumber)) {
      return NUMERIC_DAY_MAP[asNumber] ?? null;
    }
    return null;
  }
  return NUMERIC_DAY_MAP[value] ?? null;
}

export function numericDayToDayOfWeek(value: number): DayOfWeek | null {
  return parseDayOfWeek(value);
}

export function isBreakPeriod(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  return (
    normalized.includes("interval") ||
    normalized.includes("break") ||
    normalized.includes("lunch") ||
    normalized.includes("recess")
  );
}

export function periodShortName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return "—";
  }
  if (isBreakPeriod(trimmed)) {
    return "INT";
  }
  const match = trimmed.match(/period\s*(\d+)/i);
  if (match) {
    return `P${match[1]}`;
  }
  return trimmed.slice(0, 3).toUpperCase();
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getWeekStartMonday(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = start.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diff);
  return start;
}

export function addWeeks(base: Date, delta: number): Date {
  const next = new Date(base);
  next.setDate(next.getDate() + delta * 7);
  return next;
}

export function getWeekWindowFromWeekOf(weekOf: string): { from: string; to: string } {
  if (!weekOf?.trim()) {
    const start = getWeekStartMonday(new Date());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { from: toDateKey(start), to: toDateKey(end) };
  }

  const parts = weekOf.split("-").map(Number);
  if (parts.length !== 3) {
    return { from: weekOf, to: weekOf };
  }

  const [year, month, day] = parts;
  const start = getWeekStartMonday(new Date(year, month - 1, day));
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { from: toDateKey(start), to: toDateKey(end) };
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

const DAY_FULL_LABELS: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

export function formatDayShort(day: DayOfWeek): string {
  return DAY_LABELS[day] ?? day;
}

export function formatDayFull(day: DayOfWeek): string {
  return DAY_FULL_LABELS[day] ?? day;
}

export function formatPeriodTime(start: string, end: string): string {
  return `${start} – ${end}`;
}

export function formatTimetableDate(isoDate: string): string {
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

export function formatTimetableWindow(from: string, to: string): string {
  return `${formatTimetableDate(from)} – ${formatTimetableDate(to)}`;
}

export function getDaysWithSlots(data: TimetableData): DayOfWeek[] {
  const days = new Set<DayOfWeek>();
  for (const slot of data.recurring) {
    days.add(slot.day_of_week);
  }
  return WEEKDAY_ORDER.filter((day) => days.has(day));
}

export function getSlotsForDay(
  data: TimetableData,
  day: DayOfWeek,
): TimetableSlot[] {
  const recurring = data.recurring
    .filter((slot) => slot.day_of_week === day)
    .sort((a, b) => a.period.start_time.localeCompare(b.period.start_time));

  const specificForDay = data.specific
    .filter((slot) => slot.day_of_week === day)
    .sort((a, b) => a.period.start_time.localeCompare(b.period.start_time));

  if (specificForDay.length === 0) {
    return recurring;
  }

  const overriddenPeriodIds = new Set(
    specificForDay.map((slot) => slot.period.id),
  );

  const merged = [
    ...recurring.filter((slot) => !overriddenPeriodIds.has(slot.period.id)),
    ...specificForDay,
  ];

  return merged.sort((a, b) =>
    a.period.start_time.localeCompare(b.period.start_time),
  );
}

export function getSubjectColor(code: string | undefined): string {
  const palette: Record<string, string> = {
    MATH: "#D97706",
    MAT: "#D97706",
    ENG: "#2563EB",
    SCI: "#15803D",
    SIN: "#7C3AED",
    HIS: "#B45309",
    ICT: "#0891B2",
    ART: "#DB2777",
    PE: "#059669",
  };

  if (!code) {
    return "#71717A";
  }

  return palette[code.toUpperCase()] ?? "#71717A";
}
