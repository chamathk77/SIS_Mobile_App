import { configureStore } from '@reduxjs/toolkit';

import SystemInitializationReducer from '../store/reducers/SystemIntitializationReducer';
import AuthReducer from '../store/reducers/AuthReducer';
import StudentDataReducer from '../store/reducers/StudentDataReducer';
import AttendanceReducer from '../store/reducers/AttendanceReducer';

export const store = configureStore({
  reducer: {
    SystemInitializationReducer: SystemInitializationReducer,
    AuthReducer: AuthReducer,
    StudentDataReducer: StudentDataReducer,
    AttendanceReducer: AttendanceReducer,
  },
});

// Infer types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
