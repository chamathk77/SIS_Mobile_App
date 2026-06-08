import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../config/apiConfig";
import { ApiErrorResponse } from "../type/common";
import {
  GetTimetable_Request,
  GetTimetable_Response,
  TimetableData,
  TimetablePeriod,
  TimetableSlot,
} from "../type/timetable";
import {
  getWeekWindowFromWeekOf,
  isBreakPeriod,
  parseDayOfWeek,
  periodShortName,
  WEEKDAY_ORDER,
} from "../utils/timetableHelpers";

function normalizeTimeValue(time?: string | null): string {
  if (!time?.trim()) {
    return "";
  }
  return time.length >= 5 ? time.slice(0, 5) : time;
}

function normalizePeriod(period: {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
  short_name?: string;
  is_break?: boolean;
}): TimetablePeriod {
  const isBreak = period.is_break ?? isBreakPeriod(period.name);
  return {
    id: period.id,
    name: period.name,
    short_name: period.short_name ?? periodShortName(period.name),
    start_time: normalizeTimeValue(period.start_time),
    end_time: normalizeTimeValue(period.end_time),
    is_break: isBreak,
  };
}

/** API returns recurring[] with numeric day_of_week — map to monday, tuesday, … */
function normalizeRecurringSlots(rawSlots: any[]): TimetableSlot[] {
  const slots: TimetableSlot[] = [];

  for (const raw of rawSlots) {
    const dayOfWeek = parseDayOfWeek(raw?.day_of_week);
    if (!dayOfWeek || !raw?.period) {
      continue;
    }

    slots.push({
      id: Number(raw.id ?? slots.length + 1),
      day_of_week: dayOfWeek,
      specific_date: raw.specific_date ?? null,
      period: normalizePeriod(raw.period),
      subject: raw.subject ?? null,
      teacher: raw.teacher ?? null,
      room: raw.room ?? null,
      notes: raw.notes ?? null,
    });
  }

  return slots.sort((a, b) => {
    const dayDiff =
      WEEKDAY_ORDER.indexOf(a.day_of_week) - WEEKDAY_ORDER.indexOf(b.day_of_week);
    if (dayDiff !== 0) {
      return dayDiff;
    }
    return a.period.start_time.localeCompare(b.period.start_time);
  });
}

function buildRecurringSlots(
  periods: Array<{
    id: number;
    name: string;
    start_time: string;
    end_time: string;
  }>,
  entries: Array<{
    day_of_week: number | string;
    period_id?: number;
    period?: { id: number };
    subject?: { id: number; name: string; code: string } | null;
    teacher?: { id: number; name: string } | null;
    room?: string | null;
    notes?: string | null;
  }>,
): TimetableSlot[] {
  const sortedPeriods = [...periods].sort((a, b) =>
    a.start_time.localeCompare(b.start_time),
  );
  const entryMap = new Map<string, (typeof entries)[number]>();
  for (const entry of entries) {
    const periodId = entry.period_id ?? entry.period?.id;
    if (periodId == null) {
      continue;
    }
    entryMap.set(`${entry.day_of_week}-${periodId}`, entry);
  }

  const dayNumbers = [
    ...new Set(
      entries
        .map((entry) => entry.day_of_week)
        .filter((day) => parseDayOfWeek(day) != null),
    ),
  ].sort((a, b) => Number(a) - Number(b));

  const slots: TimetableSlot[] = [];
  let slotId = 1;

  for (const dayNumber of dayNumbers) {
    const dayOfWeek = parseDayOfWeek(dayNumber);
    if (!dayOfWeek) {
      continue;
    }

    for (const period of sortedPeriods) {
      const normalizedPeriod = normalizePeriod(period);
      const entry = entryMap.get(`${dayNumber}-${period.id}`);

      if (entry || normalizedPeriod.is_break) {
        slots.push({
          id: slotId++,
          day_of_week: dayOfWeek,
          specific_date: null,
          period: normalizedPeriod,
          subject: entry?.subject ?? null,
          teacher: entry?.teacher ?? null,
          room: entry?.room ?? null,
          notes: entry?.notes ?? null,
        });
      }
    }
  }

  return slots;
}

function extractTimetablePayload(raw: any): Record<string, any> {
  const top = raw?.data ?? raw ?? {};
  if (top && typeof top === "object" && !Array.isArray(top)) {
    return top as Record<string, any>;
  }
  return {};
}

function normalizeTimetableData(
  raw: any,
  requestedRange: { from: string; to: string },
): TimetableData {
  const payload = extractTimetablePayload(raw);
  const periods = Array.isArray(payload.periods) ? payload.periods : [];
  const entries = Array.isArray(payload.entries) ? payload.entries : [];
  const recurringRaw = Array.isArray(payload.recurring) ? payload.recurring : [];
  const specificRaw = Array.isArray(payload.specific) ? payload.specific : [];

  const weekOf = String(payload.week_of ?? requestedRange.from);
  const apiWindow =
    payload.window && typeof payload.window === "object"
      ? payload.window
      : payload;
  const classInfo =
    payload.class && typeof payload.class === "object" ? payload.class : {};

  const from = String(
    apiWindow.from ??
      payload.date_from ??
      getWeekWindowFromWeekOf(weekOf).from ??
      requestedRange.from,
  );
  const to = String(
    apiWindow.to ??
      payload.date_to ??
      getWeekWindowFromWeekOf(weekOf).to ??
      requestedRange.to,
  );

  const recurring =
    recurringRaw.length > 0
      ? normalizeRecurringSlots(recurringRaw)
      : buildRecurringSlots(periods, entries);

  const specific = specificRaw.length > 0 ? normalizeRecurringSlots(specificRaw) : [];

  return {
    class: {
      id: Number(classInfo.id ?? 0),
      name: String(classInfo.name ?? "Class"),
      code: classInfo.code != null ? String(classInfo.code) : undefined,
      grade: classInfo.grade != null ? String(classInfo.grade) : undefined,
      academic_year:
        classInfo.academic_year != null ? String(classInfo.academic_year) : undefined,
    },
    window: { from, to },
    week_of: weekOf,
    recurring,
    specific,
  };
}

function buildTimetableQuery(params: GetTimetable_Request): string {
  return new URLSearchParams({
    from: params.from,
    to: params.to,
  }).toString();
}

export const GetTimetable_Service = createAsyncThunk(
  "timetable/getTimetable",
  async (params: GetTimetable_Request) => {
    try {
      const response = await apiClient.get<any>(
        `timetable?${buildTimetableQuery(params)}`,
        {
          headers: {
            "X-Student-Id": params.student_id,
          },
        },
      );

      if (response.status === 200) {
        const payload = response.data ?? {};
        const normalized: GetTimetable_Response = {
          success: payload.success,
          message: payload.message,
          data: normalizeTimetableData(payload, {
            from: params.from,
            to: params.to,
          }),
        };
        return normalized;
      }

      const apiError: ApiErrorResponse = {
        error: "Error",
        message: "Failed to load timetable",
        status: response.status,
        timestamp: new Date().toISOString(),
      };
      throw apiError;
    } catch (error: any) {
      if (error.error && error.message && error.status && error.timestamp) {
        throw error as ApiErrorResponse;
      }

      const apiMessage =
        error?.response?.data?.message ??
        (typeof error?.response?.data === "string"
          ? error.response.data
          : undefined);

      const networkError: ApiErrorResponse = {
        error: "Network Error",
        message:
          apiMessage ||
          error.message ||
          "Network error. Please check your connection and try again.",
        status: error?.response?.status ?? 0,
        timestamp: new Date().toISOString(),
      };
      throw networkError;
    }
  },
);
