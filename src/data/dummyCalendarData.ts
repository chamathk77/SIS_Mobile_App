import { CalendarEvent } from "../type/calendar";

export const DUMMY_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 1,
    title: "May Day",
    type: "holiday",
    date: "2026-05-01",
    is_all_day: true,
    description: "Public holiday",
  },
  {
    id: 2,
    title: "Parent-Teacher Meeting",
    type: "parent_meeting",
    date: "2026-05-05",
    is_all_day: false,
    start_time: "14:00",
    end_time: "16:00",
    location: "Main Hall",
    description: "Grade 1 parents",
  },
  {
    id: 3,
    title: "Science Fair",
    type: "other",
    date_from: "2026-05-08",
    date_to: "2026-05-09",
    is_all_day: true,
    description: "Student projects on display",
  },
  {
    id: 4,
    title: "Mid-Term Exams",
    type: "exam",
    date_from: "2026-05-12",
    date_to: "2026-05-16",
    is_all_day: true,
    description: "Written assessments",
  },
  {
    id: 5,
    title: "Sports Day",
    type: "sports_meet",
    date: "2026-05-20",
    is_all_day: true,
    location: "School grounds",
  },
];
