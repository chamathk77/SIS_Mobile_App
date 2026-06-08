import { Ionicons } from "@expo/vector-icons";
import {
  CalendarEvent,
  CalendarEventType,
  CalendarMeta,
} from "../type/calendar";

const EVENT_TYPE_COLORS: Record<string, string> = {
  holiday: "#ef4444",
  exam: "#f59e0b",
  sports_meet: "#10b981",
  parent_meeting: "#2563eb",
  field_trip: "#8b5cf6",
  ceremony: "#ec4899",
  meeting: "#6366f1",
  other: "#64748b",
};

export function getCalendarLastPage(meta: CalendarMeta | undefined): number {
  if (!meta) {
    return 1;
  }
  if (meta.last_page != null && meta.last_page > 0) {
    return meta.last_page;
  }
  return Math.max(1, Math.ceil(meta.total / meta.per_page));
}

export function getEventStartDate(event: CalendarEvent): string {
  return event.date ?? event.date_from ?? "";
}

export function getEventEndDate(event: CalendarEvent): string {
  if (event.date) {
    return event.date;
  }
  return event.date_to ?? event.date_from ?? "";
}

export function getEventTitle(event: CalendarEvent): string {
  return event.name?.trim() || event.title?.trim() || "Event";
}

export function getEventTypeColor(type: CalendarEventType | string): string {
  return EVENT_TYPE_COLORS[type] ?? EVENT_TYPE_COLORS.other;
}

export function resolveCalendarColor(color?: string | null): string | null {
  if (!color) {
    return null;
  }
  const value = color.trim().toLowerCase();
  if (!value) {
    return null;
  }
  if (value.startsWith("#")) {
    return color;
  }
  const map: Record<string, string> = {
    green: "#22c55e",
    red: "#ef4444",
    orange: "#f97316",
    purple: "#a855f7",
    blue: "#3b82f6",
    yellow: "#eab308",
    gray: "#64748b",
    grey: "#64748b",
  };
  return map[value] ?? null;
}

export function isSchoolClosedEvent(event: CalendarEvent): boolean {
  if (event.closes_school === true) {
    return true;
  }
  return event.type === "holiday";
}

export function formatCalendarDate(isoDate: string): string {
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

export function formatMonthYear(year: number, month: number): string {
  const date = new Date(year, month, 1);
  return date.toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function getMonthBounds(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start, end };
}

export function addMonths(base: Date, delta: number): Date {
  return new Date(base.getFullYear(), base.getMonth() + delta, 1);
}

export function getDefaultCalendarRange(reference = new Date()) {
  const from = new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate(),
  );
  const to = new Date(from);
  to.setDate(to.getDate() + 60);
  return { from: toDateKey(from), to: toDateKey(to) };
}

export function eventOverlapsRange(
  event: CalendarEvent,
  from: string,
  to: string,
): boolean {
  const eventStart = getEventStartDate(event);
  const eventEnd = getEventEndDate(event);
  if (!eventStart) {
    return false;
  }
  return eventStart <= to && eventEnd >= from;
}

export function filterEventsByDateRange(
  events: CalendarEvent[],
  from?: string,
  to?: string,
): CalendarEvent[] {
  if (!from && !to) {
    return events;
  }

  const rangeFrom = from ?? "1900-01-01";
  const rangeTo = to ?? "2999-12-31";

  return events.filter((event) => eventOverlapsRange(event, rangeFrom, rangeTo));
}

export function filterEventsByMonth(
  events: CalendarEvent[],
  year: number,
  month: number,
): CalendarEvent[] {
  const { start, end } = getMonthBounds(year, month);
  const from = toDateKey(start);
  const to = toDateKey(end);
  return filterEventsByDateRange(events, from, to);
}

export function groupEventsByDate(
  events: CalendarEvent[],
): { date: string; events: CalendarEvent[] }[] {
  const map = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const key = getEventStartDate(event);
    if (!key) {
      continue;
    }
    const list = map.get(key) ?? [];
    list.push(event);
    map.set(key, list);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, grouped]) => ({
      date,
      events: grouped.sort((a, b) => {
        if (a.is_all_day && !b.is_all_day) {
          return -1;
        }
        if (!a.is_all_day && b.is_all_day) {
          return 1;
        }
        return (a.start_time ?? "").localeCompare(b.start_time ?? "");
      }),
    }));
}

export function formatEventType(type: CalendarEventType): string {
  if (!type) {
    return "Event";
  }
  return String(type)
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatEventTime(event: CalendarEvent): string {
  if (event.is_all_day) {
    return "";
  }
  if (event.start_time && event.end_time) {
    return `${event.start_time} – ${event.end_time}`;
  }
  if (event.start_time) {
    return event.start_time;
  }
  return "";
}

export function formatEventDateRange(event: CalendarEvent): string {
  const start = getEventStartDate(event);
  const end = getEventEndDate(event);
  if (end && end !== start) {
    return `${formatCalendarDate(start)} – ${formatCalendarDate(end)}`;
  }
  return formatCalendarDate(start);
}

export function getEventIconForType(
  type: CalendarEventType | string,
): keyof typeof Ionicons.glyphMap {
  const map: Record<string, keyof typeof Ionicons.glyphMap> = {
    holiday: "sunny-outline",
    exam: "document-text-outline",
    sports_meet: "football-outline",
    parent_meeting: "people-outline",
    field_trip: "bus-outline",
    ceremony: "ribbon-outline",
    meeting: "people-circle-outline",
    other: "calendar-outline",
  };

  return map[type] ?? "calendar-outline";
}

export function resolveCalendarIcon(
  icon?: string | null,
): keyof typeof Ionicons.glyphMap | null {
  if (!icon) {
    return null;
  }
  const value = icon.trim().toLowerCase();
  if (!value) {
    return null;
  }

  const map: Record<string, keyof typeof Ionicons.glyphMap> = {
    users: "people-outline",
    "building-library": "business-outline",
    briefcase: "briefcase-outline",
    moon: "moon-outline",
    sun: "sunny-outline",
    football: "football-outline",
    book: "book-outline",
    flask: "flask-outline",
    school: "school-outline",
    flag: "flag-outline",
    laptop: "laptop-outline",
    megaphone: "megaphone-outline",
    "document-text": "document-text-outline",
    "color-palette": "color-palette-outline",
  };

  return map[value] ?? null;
}

/** @deprecated use getEventIconForType */
export function getEventIconName(
  icon: string,
): keyof typeof Ionicons.glyphMap {
  const map: Record<string, keyof typeof Ionicons.glyphMap> = {
    sun: "sunny-outline",
    sunny: "sunny-outline",
    moon: "moon-outline",
    people: "people-outline",
    flask: "flask-outline",
    book: "book-outline",
    football: "football-outline",
    school: "school-outline",
    flag: "flag-outline",
    laptop: "laptop-outline",
    egg: "egg-outline",
    megaphone: "megaphone-outline",
    "document-text": "document-text-outline",
    "color-palette": "color-palette-outline",
  };

  return map[icon] ?? "calendar-outline";
}

export function getUpcomingEvents(
  events: CalendarEvent[],
  limit = 4,
): CalendarEvent[] {
  const todayKey = toDateKey(new Date());
  return [...events]
    .filter((event) => getEventEndDate(event) >= todayKey)
    .sort((a, b) => getEventStartDate(a).localeCompare(getEventStartDate(b)))
    .slice(0, limit);
}

export const CALENDAR_WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type CalendarGridCell = {
  dateKey: string;
  day: number;
  inCurrentMonth: boolean;
};

export function buildMonthGrid(year: number, month: number): CalendarGridCell[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
  const cells: CalendarGridCell[] = [];

  for (let i = mondayOffset; i > 0; i--) {
    const date = new Date(year, month, 1 - i);
    cells.push({
      dateKey: toDateKey(date),
      day: date.getDate(),
      inCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    cells.push({
      dateKey: toDateKey(date),
      day,
      inCurrentMonth: true,
    });
  }

  let trailingDay = 1;
  while (cells.length % 7 !== 0) {
    const date = new Date(year, month + 1, trailingDay++);
    cells.push({
      dateKey: toDateKey(date),
      day: date.getDate(),
      inCurrentMonth: false,
    });
  }

  return cells;
}

/** Maps each date key to events that fall on that day (includes multi-day spans). */
export function buildEventsByDateMap(
  events: CalendarEvent[],
): Map<string, CalendarEvent[]> {
  const map = new Map<string, CalendarEvent[]>();

  for (const event of events) {
    const startKey = getEventStartDate(event);
    const endKey = getEventEndDate(event) || startKey;
    if (!startKey) {
      continue;
    }

    const startParts = startKey.split("-").map(Number);
    const endParts = endKey.split("-").map(Number);
    const cursor = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    const end = new Date(endParts[0], endParts[1] - 1, endParts[2]);

    while (cursor <= end) {
      const key = toDateKey(cursor);
      const list = map.get(key) ?? [];
      if (!list.some((item) => item.id === event.id)) {
        list.push(event);
        map.set(key, list);
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return map;
}

export function getPrimaryEventColor(event: CalendarEvent): string {
  return resolveCalendarColor(event.color) ?? getEventTypeColor(event.type);
}
