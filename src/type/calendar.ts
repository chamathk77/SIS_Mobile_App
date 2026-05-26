export type CalendarEventType =
  | "holiday"
  | "exam"
  | "meeting"
  | "activity"
  | "announcement"
  | string;

export interface CalendarEvent {
  id: number;
  name: string;
  description: string | null;
  date: string;
  end_date: string | null;
  start_at: string | null;
  end_at: string | null;
  is_all_day: boolean;
  closes_school: boolean;
  is_recurring: boolean;
  type: CalendarEventType;
  category: string;
  color: string;
  icon: string;
  location: string | null;
}

export interface CalendarWindow {
  from: string;
  to: string;
}

export interface CalendarData {
  student_id: number;
  window: CalendarWindow;
  events: CalendarEvent[];
}

export interface GetCalendar_Response {
  success: boolean;
  message: string;
  data: CalendarData;
}

export type AppliedCalendarFilters = {
  from?: string;
  to?: string;
};
