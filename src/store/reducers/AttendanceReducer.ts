import { createSlice } from "@reduxjs/toolkit";
import { GetAttendance_Service } from "../../services/AttendanceService";
import { logout } from "./AuthReducer";
import { devLog } from "../../utils/devLog";

interface AttendanceState {
  loading: boolean;
  error: string | null;
  success: boolean;
  data: any;
}

const initialState: AttendanceState = {
  loading: false,
  error: null,
  success: false,
  data: null,
};

export const AttendanceSlice = createSlice({
  name: "Attendance",
  initialState,
  reducers: {
    resetAttendance: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);

    builder.addCase(GetAttendance_Service.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(GetAttendance_Service.fulfilled, (state, action) => {
      devLog("Get Attendance Fulfilled:", action.payload);
      state.loading = false;
      state.success = true;
      state.error = null;

      const page = action.payload.page ?? 1;
      if (page === 1 || !state.data?.data) {
        state.data = action.payload;
      } else {
        const prev = state.data.data;
        const next = action.payload.data;
        state.data = {
          ...action.payload,
          data: {
            ...next,
            summary: next.summary ?? prev.summary,
            records: [...prev.records, ...next.records],
            meta: next.meta,
          },
        };
      }
    });
    builder.addCase(GetAttendance_Service.rejected, (state, action) => {
      devLog("Get Attendance Rejected:", action.error);
      state.loading = false;
      state.error = action.error.message || "An error occurred";
      state.success = false;
    });
  },
});

export const { resetAttendance } = AttendanceSlice.actions;

export default AttendanceSlice.reducer;
