import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { login_Service } from '../../services/AuthService';



interface AuthState {
    LoginApiState: {
        loading: boolean;
        error: string | null;
        success: boolean;
        data: any;


        userData: any;
        SchoolData: any;
    };
   
}

const initialState: AuthState = {

    LoginApiState: {
        loading: false,
        error: null,
        success: false,
        data: null,
        //
        userData: null,
        SchoolData: null,
      },

}

export const AuthSlice = createSlice({
    name: 'Auth',
    initialState,
    reducers: {
        setUserData: (state, action: PayloadAction<any>) => {
            state.LoginApiState.userData = action.payload; 
        },
        setSchoolData: (state, action: PayloadAction<any>) => {
            state.LoginApiState.SchoolData = action.payload;
        },
       
    },extraReducers: (builder) => {
        builder.addCase(login_Service.pending, (state) => {
            state.LoginApiState.loading = true;
            state.LoginApiState.error = null;
            state.LoginApiState.success = false;
            state.LoginApiState.data = null;
        });
        builder.addCase(login_Service.fulfilled, (state, action) => {
            console.log('Login Fulfilled:', action.payload);
            state.LoginApiState.loading = false;
            state.LoginApiState.success = true;
            state.LoginApiState.error = null;
            state.LoginApiState.data = action.payload;

        });
        builder.addCase(login_Service.rejected, (state, action) => {
            console.log('Login Rejected:', action.error);
            state.LoginApiState.loading = false;
            state.LoginApiState.error = action.error.message || 'An error occurred';
            state.LoginApiState.success = false;
            state.LoginApiState.data = null;
        });
    },
});

export const { setUserData, setSchoolData } = AuthSlice.actions;

export default AuthSlice.reducer;
