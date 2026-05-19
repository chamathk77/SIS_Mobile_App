import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  ForgotPassword_CreateNewPassword_Service,
  ForgotPassword_EnterEmail_Service,
  ForgotPassword_EnterPin_Service,
  GetStudentProfile_Service,
  login_Service,
  SelectStudent_Service,
} from "../../services/AuthService";
import { devLog } from "../../utils/devLog";

interface AuthState {
  Login: {
    loading: boolean;
    error: string | null;
    success: boolean;
    data: any;

    userData: any;
    studentsData: any[];
    schoolsData: any[];
  };

  ForgotPasswordEnterEmail: {
    loading: boolean;
    error: string | null;
    success: boolean;
    data: any;

    email: string;
  };

  ForgotPasswordEnterPin: {
    loading: boolean;
    error: string | null;
    success: boolean;
    data: any;

    reset_token: string;
  };

  ForgotPasswordCreateNewPassword: {
    loading: boolean;
    error: string | null;
    success: boolean;
    data: any;
  };
  SelectStudent: {
    loading: boolean;
    error: string | null;
    success: boolean;
    data: any;
    
    selectedStudentId: string;
  };
  GetStudentProfile: {
    loading: boolean;
    error: string | null;
    success: boolean;
    data: any;
  };
}

const initialState: AuthState = {
  Login: {
    loading: false,
    error: null,
    success: false,
    data: null,
    //
    userData: null,
    studentsData: [],
    schoolsData: [],
  },

  ForgotPasswordEnterEmail: {
    loading: false,
    error: null,
    success: false,
    data: null,

    email: "",
  },

  ForgotPasswordEnterPin: {
    loading: false,
    error: null,
    success: false,
    data: null,

    reset_token: "",
  },
  ForgotPasswordCreateNewPassword: {
    loading: false,
    error: null,
    success: false,
    data: null,
  },
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

export const AuthSlice = createSlice({
  name: "Auth",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<any>) => {
      state.Login.userData = action.payload;
      devLog("setUserData saved to reducer ", action.payload);
    },
    setSchoolData: (state, action: PayloadAction<any>) => {
      state.Login.schoolsData = action.payload;
      devLog("setSchoolData saved to reducer ", action.payload);
    },
    setStudentsData: (state, action: PayloadAction<any[]>) => {
      state.Login.studentsData = action.payload;
      devLog("setStudentsData saved to reducer ", action.payload);
    },
    setForgotPasswordEmail: (state, action: PayloadAction<string>) => {
      state.ForgotPasswordEnterEmail.email = action.payload;
      devLog("setForgotPasswordEmail saved to reducer ", action.payload);
    },
    logout: () => initialState,
  },
  extraReducers: (builder) => {
    builder.addCase(login_Service.pending, (state) => {
      state.Login.loading = true;
      state.Login.error = null;
      state.Login.success = false;
      state.Login.data = null;
    });
    builder.addCase(login_Service.fulfilled, (state, action) => {
      devLog("Login Fulfilled:", action.payload);
      state.Login.loading = false;
      state.Login.success = true;
      state.Login.error = null;
      state.Login.data = action.payload;
    });
    builder.addCase(login_Service.rejected, (state, action) => {
      devLog("Login Rejected:", action.error);
      state.Login.loading = false;
      state.Login.error = action.error.message || "An error occurred";
      state.Login.success = false;
      state.Login.data = null;
    });

    //Forgot Password

    builder.addCase(ForgotPassword_EnterEmail_Service.pending, (state) => {
      state.ForgotPasswordEnterEmail.loading = true;
      state.ForgotPasswordEnterEmail.error = null;
      state.ForgotPasswordEnterEmail.success = false;
      state.ForgotPasswordEnterEmail.data = null;
    });
    builder.addCase(
      ForgotPassword_EnterEmail_Service.fulfilled,
      (state, action) => {
        devLog("Forgot Password Enter Email Fulfilled:", action.payload);
        state.ForgotPasswordEnterEmail.loading = false;
        state.ForgotPasswordEnterEmail.success = true;
        state.ForgotPasswordEnterEmail.error = null;
        state.ForgotPasswordEnterEmail.data = action.payload;
      },
    );
    builder.addCase(
      ForgotPassword_EnterEmail_Service.rejected,
      (state, action) => {
        devLog("Forgot Password Enter Email Rejected:", action.error);
        state.ForgotPasswordEnterEmail.loading = false;
        state.ForgotPasswordEnterEmail.error =
          action.error.message || "An error occurred";
        state.ForgotPasswordEnterEmail.success = false;
        state.ForgotPasswordEnterEmail.data = null;
      },
    );

    //Forgot Password Enter Pin

    builder.addCase(ForgotPassword_EnterPin_Service.pending, (state) => {
      state.ForgotPasswordEnterPin.loading = true;
      state.ForgotPasswordEnterPin.error = null;
      state.ForgotPasswordEnterPin.success = false;
      state.ForgotPasswordEnterPin.data = null;
    });
    builder.addCase(
      ForgotPassword_EnterPin_Service.fulfilled,
      (state, action) => {
        devLog("Forgot Password Enter Pin Fulfilled:", action.payload);
        state.ForgotPasswordEnterPin.loading = false;
        state.ForgotPasswordEnterPin.success = true;
        state.ForgotPasswordEnterPin.error = null;
        state.ForgotPasswordEnterPin.data = action.payload;
      },
    );
    builder.addCase(
      ForgotPassword_EnterPin_Service.rejected,
      (state, action) => {
        devLog("Forgot Password Enter Pin Rejected:", action.error);
        state.ForgotPasswordEnterPin.loading = false;
        state.ForgotPasswordEnterPin.error =
          action.error.message || "An error occurred";
        state.ForgotPasswordEnterPin.success = false;
        state.ForgotPasswordEnterPin.data = null;
      },
    );

    //Forgot Password Create New Password

    builder.addCase(
      ForgotPassword_CreateNewPassword_Service.pending,
      (state) => {
        state.ForgotPasswordCreateNewPassword.loading = true;
        state.ForgotPasswordCreateNewPassword.error = null;
        state.ForgotPasswordCreateNewPassword.success = false;
        state.ForgotPasswordCreateNewPassword.data = null;
      },
    );
    builder.addCase(
      ForgotPassword_CreateNewPassword_Service.fulfilled,
      (state, action) => {
        devLog(
          "Forgot Password Create New Password Fulfilled:",
          action.payload,
        );
        state.ForgotPasswordCreateNewPassword.loading = false;
        state.ForgotPasswordCreateNewPassword.success = true;
        state.ForgotPasswordCreateNewPassword.error = null;
        state.ForgotPasswordCreateNewPassword.data = action.payload;
      },
    );
    builder.addCase(
      ForgotPassword_CreateNewPassword_Service.rejected,
      (state, action) => {
        devLog("Forgot Password Create New Password Rejected:", action.error);
        state.ForgotPasswordCreateNewPassword.loading = false;
        state.ForgotPasswordCreateNewPassword.error =
          action.error.message || ("An error occurred" as null);
        state.ForgotPasswordCreateNewPassword.success = false;
        state.ForgotPasswordCreateNewPassword.data = null;
      },
    );

    //Select Student

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
      state.SelectStudent.selectedStudentId = action.payload.data.student.id.toString();
      console.log("selectedStudentId", state.SelectStudent.selectedStudentId);``
    });
    builder.addCase(SelectStudent_Service.rejected, (state, action) => {
      devLog("Select Student Rejected:", action.error);
      state.SelectStudent.loading = false;
      state.SelectStudent.error =
        action.error.message || ("An error occurred" as null);
      state.SelectStudent.success = false;
      state.SelectStudent.data = null;
    });

    //Get Student Profile

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
        action.error.message || ("An error occurred" as null);
      state.GetStudentProfile.success = false;
      state.GetStudentProfile.data = null;
    });
  },
});

export const {
  setUserData,
  setSchoolData,
  setStudentsData,
  setForgotPasswordEmail,
  logout,
} = AuthSlice.actions;

export default AuthSlice.reducer;
