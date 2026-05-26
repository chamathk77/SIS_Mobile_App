import { DUMMY_CALENDAR } from "./dummyCalendarData";
import { DUMMY_INVOICE_SUMMARY, DUMMY_INVOICES } from "./dummyInvoiceData";
import { DUMMY_TIMETABLE } from "./dummyTimetableData";
import { CalendarEvent } from "../type/calendar";
import { Invoice } from "../type/invoice";
import { TimetableSlot } from "../type/timetable";
import { DayOfWeek } from "../type/timetable";
import { getSlotsForDay } from "../utils/timetableHelpers";

export type DashboardAttendanceSummary = {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  monthLabel: string;
};

export type DashboardData = {
  attendance: DashboardAttendanceSummary;
  finance: {
    outstanding_total: number;
    overdue_total: number;
    paid_total_ytd: number;
  };
  classInfo: typeof DUMMY_TIMETABLE.class;
  upcomingEvents: CalendarEvent[];
  todaySchedule: TimetableSlot[];
  highlightInvoice: Invoice | null;
};

const DAY_NAMES: DayOfWeek[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

function getTodayDayOfWeek(): DayOfWeek {
  return DAY_NAMES[new Date().getDay()];
}

function getUpcomingEvents(limit = 3): CalendarEvent[] {
  const todayKey = new Date().toISOString().slice(0, 10);
  return [...DUMMY_CALENDAR.events]
    .filter((event) => event.date >= todayKey)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

export const DUMMY_DASHBOARD: DashboardData = {
  attendance: {
    present: 12,
    absent: 2,
    late: 1,
    excused: 1,
    total: 16,
    monthLabel: "May 2026",
  },
  finance: { ...DUMMY_INVOICE_SUMMARY },
  classInfo: DUMMY_TIMETABLE.class,
  upcomingEvents: getUpcomingEvents(4),
  todaySchedule: getSlotsForDay(DUMMY_TIMETABLE, getTodayDayOfWeek()).filter(
    (slot) => !slot.period.is_break,
  ),
  highlightInvoice:
    DUMMY_INVOICES.find((inv) => inv.balance_due > 0) ?? DUMMY_INVOICES[1] ?? null,
};
