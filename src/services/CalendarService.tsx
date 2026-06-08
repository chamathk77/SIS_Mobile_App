import { createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "../config/apiConfig";
import { ApiErrorResponse } from "../type/common";
import {
  CalendarEvent,
  CalendarEventCategory,
  CalendarMeta,
  GetCalendarEvents_Request,
  GetCalendarEvents_Response,
} from "../type/calendar";

function buildCalendarQuery(params: GetCalendarEvents_Request): string {
  const page = params.page ?? 1;
  const perPage = params.per_page ?? 50;
  const query = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });

  if (params.from) {
    query.set("from", params.from);
  }
  if (params.to) {
    query.set("to", params.to);
  }
  if (params.type) {
    const types = Array.isArray(params.type) ? params.type : [params.type];
    types.forEach((type) => {
      query.append("type", type);
    });
  }

  return query.toString();
}

function formatCategoryLabel(value: string): string {
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function normalizeCategory(raw: unknown): CalendarEventCategory[] | null {
  if (!raw) {
    return null;
  }

  if (Array.isArray(raw)) {
    const items = raw
      .map((item): CalendarEventCategory | null => {
        if (typeof item === "string" && item.trim()) {
          return {
            value: item,
            label: formatCategoryLabel(item),
            color: null,
            icon: null,
          };
        }
        if (item && typeof item === "object") {
          const entry = item as Record<string, unknown>;
          const value = String(entry.value ?? entry.label ?? "").trim();
          if (!value) {
            return null;
          }
          return {
            value,
            label: String(entry.label ?? formatCategoryLabel(value)),
            color: (entry.color as string | null | undefined) ?? null,
            icon: (entry.icon as string | null | undefined) ?? null,
          };
        }
        return null;
      })
      .filter((item): item is CalendarEventCategory => item != null);

    return items.length > 0 ? items : null;
  }

  if (typeof raw === "string" && raw.trim()) {
    return [{ value: raw, label: formatCategoryLabel(raw), color: null, icon: null }];
  }

  return null;
}

function normalizeCalendarEvent(event: any): CalendarEvent {
  return {
    id: Number(event?.id ?? 0),
    title: event?.title ?? event?.name ?? "Event",
    name: event?.name ?? event?.title ?? "Event",
    type: event?.type ?? "other",
    date: event?.date ?? null,
    date_from: event?.date_from ?? event?.date ?? null,
    date_to: event?.date_to ?? event?.end_date ?? null,
    is_all_day: Boolean(event?.is_all_day),
    description: event?.description ?? null,
    start_time: event?.start_time ?? event?.start_at ?? null,
    end_time: event?.end_time ?? event?.end_at ?? null,
    location: event?.location ?? null,
    color: event?.color ?? null,
    icon: event?.icon ?? null,
    closes_school: Boolean(event?.closes_school),
    category: normalizeCategory(event?.category),
  };
}

export const GetCalendarEvents_Service = createAsyncThunk(
  "calendar/getEvents",
  async (params: GetCalendarEvents_Request) => {
    try {
      const page = params.page ?? 1;
      const perPage = params.per_page ?? 50;
      const response = await apiClient.get<any>(
        `calendar-events?${buildCalendarQuery(params)}`,
        {
          headers: {
            "X-Student-Id": params.student_id,
          },
        },
      );

      if (response.status === 200) {
        console.log("response get calendar events", JSON.stringify(response.data, null, 2));
        const payload = response.data ?? {};
        const payloadData = payload.data ?? {};

        // Some environments return { data: [...] } while others return { data: { events: [...] } }.
        const rawEvents = Array.isArray(payloadData)
          ? payloadData
          : Array.isArray(payloadData.events)
            ? payloadData.events
            : [];
        const events: CalendarEvent[] = rawEvents.map(normalizeCalendarEvent);

        const meta: CalendarMeta = payload.meta ?? {
          current_page: page,
          per_page: perPage,
          total: events.length,
        };

        const normalized: GetCalendarEvents_Response = {
          success: payload.success,
          message: payload.message,
          data: events,
          meta,
        };

        return { ...normalized, page };
      }

      const apiError: ApiErrorResponse = {
        error: "Error",
        message: "Failed to load calendar events",
        status: response.status,
        timestamp: new Date().toISOString(),
      };
      throw apiError;
    } catch (error: any) {
      if (error.error && error.message && error.status && error.timestamp) {
        throw error as ApiErrorResponse;
      }

      const networkError: ApiErrorResponse = {
        error: "Network Error",
        message:
          error.message ||
          "Network error. Please check your connection and try again.",
        status: 0,
        timestamp: new Date().toISOString(),
      };
      throw networkError;
    }
  },
);
