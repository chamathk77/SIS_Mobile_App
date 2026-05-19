import { createSlice } from "@reduxjs/toolkit";
import {
  GetStudentProfile_Service,
  SelectStudent_Service,
} from "../../services/AuthService";
import { logout } from "./AuthReducer";
import { devLog } from "../../utils/devLog";

interface AsyncSliceState {
  loading: boolean;
  error: string | null;
  success: boolean;
  data: any;
}

interface StudentDataState {
  SelectStudent: AsyncSliceState & {
    selectedStudentId: string;
  };
  GetStudentProfile: AsyncSliceState;
}

const initialState: StudentDataState = {
  SelectStudent: {
    loading: false,
    error: null,
    success: false,
    data: null,
    selectedStudentId: "",
  },
  GetStudentProfile: {
    loading: false,
    error: null,
    success: false,
    data: null,
  },
};

export const StudentDataSlice = createSlice({
  name: "StudentData",
  initialState,
  reducers: {
    resetStudentData: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(logout, () => initialState);

    builder.addCase(SelectStudent_Service.pending, (state) => {
      state.SelectStudent.loading = true;
      state.SelectStudent.error = null;
      state.SelectStudent.success = false;
      state.SelectStudent.data = null;
    });
    builder.addCase(SelectStudent_Service.fulfilled, (state, action) => {
      devLog("Select Student Fulfilled:", action.payload);
      state.SelectStudent.loading = false;
      state.SelectStudent.success = true;
      state.SelectStudent.error = null;
      state.SelectStudent.data = action.payload;
      state.SelectStudent.selectedStudentId =
        action.payload.data.student.id.toString();
    });
    builder.addCase(SelectStudent_Service.rejected, (state, action) => {
      devLog("Select Student Rejected:", action.error);
      state.SelectStudent.loading = false;
      state.SelectStudent.error =
        action.error.message || "An error occurred";
      state.SelectStudent.success = false;
      state.SelectStudent.data = null;
    });

    builder.addCase(GetStudentProfile_Service.pending, (state) => {
      state.GetStudentProfile.loading = true;
      state.GetStudentProfile.error = null;
      state.GetStudentProfile.success = false;
      state.GetStudentProfile.data = null;
    });
    builder.addCase(GetStudentProfile_Service.fulfilled, (state, action) => {
      devLog("Get Student Profile Fulfilled:", action.payload);
      state.GetStudentProfile.loading = false;
      state.GetStudentProfile.success = true;
      state.GetStudentProfile.error = null;
      state.GetStudentProfile.data = action.payload;
    });
    builder.addCase(GetStudentProfile_Service.rejected, (state, action) => {
      devLog("Get Student Profile Rejected:", action.error);
      state.GetStudentProfile.loading = false;
      state.GetStudentProfile.error =
        action.error.message || "An error occurred";
      state.GetStudentProfile.success = false;
      state.GetStudentProfile.data = null;
    });
  },
});

export const { resetStudentData } = StudentDataSlice.actions;

export default StudentDataSlice.reducer;
