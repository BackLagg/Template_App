import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AdminState } from '@shared/types';

const initialState: AdminState = {
  isAdmin: false,
};

const isAdminSlice = createSlice({
  name: 'isAdmin',
  initialState,
  reducers: {
    setAdminStatus: (state, action: PayloadAction<boolean>) => {
      state.isAdmin = action.payload;
    },
  },
});

export const { setAdminStatus } = isAdminSlice.actions;
export default isAdminSlice.reducer;

