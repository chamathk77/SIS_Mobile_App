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
