import { configureStore } from '@reduxjs/toolkit';

import SystemInitializationReducer from '../store/reducers/SystemIntitializationReducer';
import AuthReducer from '../store/reducers/AuthReducer';

export const store = configureStore({
  reducer: {
    SystemInitializationReducer: SystemInitializationReducer,
    AuthReducer: AuthReducer,
 
  },
});

// Infer types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
