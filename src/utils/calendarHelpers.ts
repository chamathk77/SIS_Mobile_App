import { CalendarEvent, CalendarEventType } from "../type/calendar";

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

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getMonthBounds(year: number, month: number) {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start, end };
}

export function addMonths(base: Date, delta: number): Date {
  return new Date(base.getFullYear(), base.getMonth() + delta, 1);
}

export function eventOverlapsRange(
  event: CalendarEvent,
  from: string,
  to: string,
): boolean {
  const eventStart = event.date;
  const eventEnd = event.end_date ?? event.date;
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
    const key = event.date;
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
        return (a.start_at ?? "").localeCompare(b.start_at ?? "");
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
    return "All day";
  }
  if (event.start_at && event.end_at) {
    return `${event.start_at} – ${event.end_at}`;
  }
  if (event.start_at) {
    return event.start_at;
  }
  return "";
}

export function formatEventDateRange(event: CalendarEvent): string {
  if (event.end_date && event.end_date !== event.date) {
    return `${formatCalendarDate(event.date)} – ${formatCalendarDate(event.end_date)}`;
  }
  return formatCalendarDate(event.date);
}

import { Ionicons } from "@expo/vector-icons";

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
