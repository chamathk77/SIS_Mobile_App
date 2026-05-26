export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface TimetablePeriod {
  id: number;
  name: string;
  short_name: string;
  start_time: string;
  end_time: string;
  is_break: boolean;
}

export interface TimetableSubject {
  id: number;
  name: string;
  code: string;
}

export interface TimetableTeacher {
  id: number;
  name: string;
}

export interface TimetableClass {
  id: number;
  name: string;
  code: string;
  grade: string;
  academic_year: string;
}

export interface TimetableWindow {
  from: string;
  to: string;
}

export interface TimetableSlot {
  id: number;
  day_of_week: DayOfWeek;
  specific_date: string | null;
  period: TimetablePeriod;
  subject: TimetableSubject | null;
  teacher: TimetableTeacher | null;
  room: string | null;
  notes: string | null;
}

export interface TimetableData {
  student_id: number;
  class: TimetableClass;
  window: TimetableWindow;
  recurring: TimetableSlot[];
  specific: TimetableSlot[];
}

export interface GetTimetable_Response {
  success: boolean;
  message: string;
  data: TimetableData;
}
