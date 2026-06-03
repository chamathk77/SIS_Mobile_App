export type CalendarEventType =
  | "holiday"
  | "exam"
  | "sports_meet"
  | "parent_meeting"
  | "field_trip"
  | "ceremony"
  | "meeting"
  | "other"
  | string;

export const CALENDAR_EVENT_TYPES: CalendarEventType[] = [
  "holiday",
  "exam",
  "sports_meet",
  "parent_meeting",
  "field_trip",
  "ceremony",
  "meeting",
  "other",
];

/** API event — single-day uses `date`; multi-day uses `date_from` / `date_to`. */
export interface CalendarEvent {
  id: number;
  title: string;
  name?: string;
  type: CalendarEventType;
  date?: string | null;
  date_from?: string | null;
  date_to?: string | null;
  is_all_day: boolean;
  description?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  location?: string | null;
  color?: string | null;
  icon?: string | null;
  closes_school?: boolean;
  category?: string | null;
}

export interface CalendarMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page?: number;
}

export interface GetCalendarEvents_Response {
  success?: boolean;
  message?: string;
  data: CalendarEvent[];
  meta: CalendarMeta;
}

export interface GetCalendarEvents_Request {
  student_id: string;
  page?: number;
  per_page?: number;
  from?: string;
  to?: string;
  type?: CalendarEventType | CalendarEventType[];
}

export type AppliedCalendarFilters = {
  type?: CalendarEventType;
};
