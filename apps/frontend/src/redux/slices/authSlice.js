// src/redux/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

let parsedUser = null;
try {
  const storedUser = localStorage.getItem('userInfo');
  parsedUser = storedUser ? JSON.parse(storedUser) : null;
} catch (error) {
  console.error("Invalid userInfo in localStorage:", error);
  localStorage.removeItem('userInfo');
}

const initialState = {
  user: parsedUser,
  isSidebarOpen: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('userInfo');
    },
    setOpenSidebar: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
  },
});

export const { setCredentials, logout, setOpenSidebar } = authSlice.actions;
export default authSlice.reducer;
