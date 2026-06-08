import { createSlice } from "@reduxjs/toolkit";
import { GetCalendarEvents_Service } from "../../services/CalendarService";
import { logout } from "./AuthReducer";
import { devLog } from "../../utils/devLog";
import { GetCalendarEvents_Response } from "../../type/calendar";

type CalendarPayload = GetCalendarEvents_Response & { page?: number };

interface CalendarState {
  loading: boolean;
  error: string | null;
  success: boolean;
  data: CalendarPayload | null;
}

const initialState: CalendarState = {
  loading: false,
  error: null,
  success: false,
  data: null,
};

export const CalendarSlice = createSlice({
  name: "Calendar",
  initialState,
  reducers: {
    resetCalendar: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);

    builder.addCase(GetCalendarEvents_Service.pending, (state, action) => {
      state.loading = true;
      state.error = null;
      if ((action.meta.arg.page ?? 1) === 1) {
        state.data = null;
      }
    });
    builder.addCase(GetCalendarEvents_Service.fulfilled, (state, action) => {
      devLog("Get Calendar Events Fulfilled:", action.payload);
      console.log("Get Calendar Events Fulfilled:", JSON.stringify(action.payload, null, 2));
      state.loading = false;
      state.success = true;
      state.error = null;

      const page = action.payload.page ?? 1;
      if (page === 1 || !state.data?.data) {
        state.data = action.payload;
      } else {
        const prev = state.data.data ?? [];
        const next = action.payload.data ?? [];
        state.data = {
          ...action.payload,
          data: [...prev, ...next],
        };
      }
    });
    builder.addCase(GetCalendarEvents_Service.rejected, (state, action) => {
      devLog("Get Calendar Events Rejected:", action.error);
      state.loading = false;
      state.error = action.error.message || "An error occurred";
      state.success = false;
    });
  },
});

export const { resetCalendar } = CalendarSlice.actions;

export default CalendarSlice.reducer;
