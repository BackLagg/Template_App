import { configureStore } from '@reduxjs/toolkit';
import isAdminReducer from './slices/is-admin-slice';
import userReducer from './slices/user-slice';

const store = configureStore({
  reducer: {
    isAdmin: isAdminReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
