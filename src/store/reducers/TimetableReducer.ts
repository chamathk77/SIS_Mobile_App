import { createSlice } from "@reduxjs/toolkit";
import { GetTimetable_Service } from "../../services/TimetableService";
import { logout } from "./AuthReducer";
import { devLog } from "../../utils/devLog";
import { GetTimetable_Response } from "../../type/timetable";

interface TimetableState {
  loading: boolean;
  error: string | null;
  success: boolean;
  data: GetTimetable_Response | null;
}

const initialState: TimetableState = {
  loading: false,
  error: null,
  success: false,
  data: null,
};

export const TimetableSlice = createSlice({
  name: "Timetable",
  initialState,
  reducers: {
    resetTimetable: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);

    builder.addCase(GetTimetable_Service.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.data = null;
    });
    builder.addCase(GetTimetable_Service.fulfilled, (state, action) => {
      devLog("Get Timetable Fulfilled:", action.payload);
      state.loading = false;
      state.success = true;
      state.error = null;
      state.data = action.payload;
    });
    builder.addCase(GetTimetable_Service.rejected, (state, action) => {
      devLog("Get Timetable Rejected:", action.error);
      state.loading = false;
      state.error = action.error.message || "An error occurred";
      state.success = false;
    });
  },
});

export const { resetTimetable } = TimetableSlice.actions;

export default TimetableSlice.reducer;
